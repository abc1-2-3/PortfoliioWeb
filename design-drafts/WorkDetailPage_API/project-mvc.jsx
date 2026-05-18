/* global React, CodeBlock, Tabs, SectionHeader */

/* ---------- Before / After architecture ---------- */
function ArchDiagram(){
  return (
    <div className="arch">
      <div className="arch-side arch-before">
        <div className="arch-label">BEFORE</div>
        <div className="arch-mono-block">
          <div className="arch-monolith">
            <div className="arch-mono-head">ASP.NET MVC App</div>
            <div className="arch-mono-stack">
              <div>Views (.cshtml)</div>
              <div>Controllers</div>
              <div>Models · DbContext</div>
            </div>
            <div className="arch-mono-tag">一份專案 · 全部混在一起</div>
          </div>
        </div>
      </div>

      <div className="arch-arrow">
        <svg viewBox="0 0 60 16" width="60" height="16">
          <path d="M0 8 H52 M46 2 L52 8 L46 14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>

      <div className="arch-side arch-after">
        <div className="arch-label">AFTER · 拆成 3 個專案</div>
        <div className="arch-three">
          <div className="arch-box" data-k="web">
            <div className="arch-box-head">Web · 前端</div>
            <div className="arch-box-sub">Razor Pages / SPA</div>
            <ul>
              <li>畫面與表單</li>
              <li>呼叫 API</li>
            </ul>
          </div>
          <div className="arch-box" data-k="api">
            <div className="arch-box-head">API · 後端</div>
            <div className="arch-box-sub">Web API · Controllers</div>
            <ul>
              <li>路由 + DTO</li>
              <li>Service / Repository</li>
            </ul>
          </div>
          <div className="arch-box" data-k="test">
            <div className="arch-box-head">Tests · 測試</div>
            <div className="arch-box-sub">xUnit · Moq</div>
            <ul>
              <li>Service 單元測試</li>
              <li>Controller 整合測試</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- The 4 code segments ---------- */
const MVC_SAMPLES = [
  {
    key:"controller",
    label:"01 · Controller",
    zh:"瘦身後的 Controller",
    file:"OrderApi/Controllers/OrdersController.cs",
    lang:"csharp",
    note:"原本塞滿了驗證 + DbContext 操作 + view model 組裝。拆完之後 Controller 只剩路由 + 呼叫 Service,真正能被測試的邏輯都搬走了。",
    code:`
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orders;
    public OrdersController(IOrderService orders) => _orders = orders;

    // GET api/orders/123
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetAsync(int id)
    {
        var order = await _orders.GetByIdAsync(id);
        return order is null ? NotFound() : Ok(order);
    }

    // POST api/orders
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<OrderDto>> CreateAsync(CreateOrderRequest req)
    {
        var created = await _orders.CreateAsync(req, User.GetUserId());
        return CreatedAtAction(nameof(GetAsync), new { id = created.Id }, created);
    }
}
    `
  },
  {
    key:"service",
    label:"02 · Service",
    zh:"商業邏輯抽出來",
    file:"OrderApi/Services/OrderService.cs",
    lang:"csharp",
    note:"這層只接介面、不直接綁 DbContext;測試時可以用 Mock 把 IOrderRepository 換掉。",
    code:`
public class OrderService : IOrderService
{
    private readonly IOrderRepository _repo;
    private readonly IUnitOfWork _uow;

    public OrderService(IOrderRepository repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow  = uow;
    }

    public async Task<OrderDto> CreateAsync(CreateOrderRequest req, int userId)
    {
        // 1. 驗證商業規則
        if (req.Items.Count == 0)
            throw new DomainException("訂單至少要有一個品項");

        // 2. 組成領域物件
        var order = Order.NewFromRequest(req, userId);

        // 3. 持久化 + 交易
        await _repo.AddAsync(order);
        await _uow.SaveChangesAsync();

        return OrderDto.From(order);
    }
}
    `
  },
  {
    key:"interface",
    label:"03 · Interface",
    zh:"用介面切開耦合",
    file:"OrderApi/Abstractions/IOrderRepository.cs",
    lang:"csharp",
    note:"專案之間只認介面。Web 不依賴 API 的實作、API 也不直接依賴 EF Core 的細節。",
    code:`
public interface IOrderRepository
{
    Task<Order?> FindByIdAsync(int id);
    Task<IReadOnlyList<Order>> ListByUserAsync(int userId);
    Task AddAsync(Order order);
}

public interface IOrderService
{
    Task<OrderDto?> GetByIdAsync(int id);
    Task<OrderDto>  CreateAsync(CreateOrderRequest req, int userId);
}
    `
  },
  {
    key:"test",
    label:"04 · Tests",
    zh:"終於能寫單元測試了",
    file:"OrderApi.Tests/OrderServiceTests.cs",
    lang:"csharp",
    note:"拆完最大的收穫 — Service 可以脫離 DbContext 跑得飛快,Controller 也能用 WebApplicationFactory 做整合測試。",
    code:`
public class OrderServiceTests
{
    [Fact]
    public async Task CreateAsync_EmptyItems_Throws()
    {
        var repo = new Mock<IOrderRepository>();
        var uow  = new Mock<IUnitOfWork>();
        var sut  = new OrderService(repo.Object, uow.Object);

        var req  = new CreateOrderRequest { Items = new() };

        await Assert.ThrowsAsync<DomainException>(
            () => sut.CreateAsync(req, userId: 1));
    }

    [Fact]
    public async Task CreateAsync_Valid_PersistsAndReturnsDto()
    {
        // arrange ... act ... assert
        // 完整測試見 repo
    }
}
    `
  },
];

const STEPS = [
  { k:"a", t:"抽出介面",   d:"先把 Repository / Service / UnitOfWork 介面寫好,讓 Controller 只依賴 abstraction。" },
  { k:"b", t:"搬出邏輯",   d:"把 Controller 裡的驗證 + 商業規則整段搬到 Service;EF 操作落到 Repository。" },
  { k:"c", t:"切出專案",   d:"在 solution 裡新增 Web / Api / Tests 三個 csproj,設定專案參照關係。" },
  { k:"d", t:"補上測試",   d:"用 xUnit + Moq 蓋住 Service;Controller 用 WebApplicationFactory 做端到端測試。" },
];

function ProjectMvc(){
  const [tab, setTab] = React.useState("controller");
  const current = MVC_SAMPLES.find(s => s.key === tab);

  return (
    <section className="project project-mvc">
      <SectionHeader
        index={2}
        en="MVC · Split & Test"
        zh="把 MVC 架構拆成前後端 + 測試三個專案"
        summary="一份示範性的教學 demo — 從一坨混在一起的 ASP.NET MVC 開始,拆出 Web、API、Tests 三個 csproj,並引入介面 + 依賴注入,讓商業邏輯真的能被單元測試蓋到。重點不在功能,而是『怎麼拆』。"
        tags={["C#", "ASP.NET Core", ".NET 8", "xUnit", "Moq", "Clean Architecture"]}
      />

      <div className="repo-link-row">
        <span className="repo-link as-note">
          <span className="repo-mark mark-note">·</span>
          <span className="repo-path">local-only demo · 沒推上 GitHub</span>
          <span className="repo-meta">概念示範 · 沒有功能性</span>
        </span>
      </div>

      <ArchDiagram />

      <div className="mvc-grid">
        <aside className="mvc-steps">
          <div className="mvc-steps-head">
            <span className="eyebrow"><span className="dot"></span>4 STEPS</span>
            <div className="mvc-steps-title">重構順序</div>
          </div>
          <ol className="mvc-step-list">
            {STEPS.map((s, i) => (
              <li key={s.k}>
                <span className="mvc-step-num">{String(i+1).padStart(2,'0')}</span>
                <div>
                  <div className="mvc-step-t">{s.t}</div>
                  <div className="mvc-step-d">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        <div className="mvc-code-col">
          <div className="mvc-code-top">
            <Tabs
              items={MVC_SAMPLES.map(s => ({ value: s.key, label: s.label }))}
              value={tab}
              onChange={setTab}
            />
            <div className="mvc-zh">{current.zh}</div>
          </div>
          <p className="mvc-note">{current.note}</p>
          <CodeBlock
            code={current.code}
            lang={current.lang}
            file={current.file}
            showLineNumbers={true}
          />
        </div>
      </div>
    </section>
  );
}

window.ProjectMvc = ProjectMvc;
