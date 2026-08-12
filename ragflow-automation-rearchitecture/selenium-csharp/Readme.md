## Selenium + NUnit Automation Framework (.NET)

### 📌 Overview

This is a Selenium-based UI automation framework built using:

- **.NET** `net10.0`
- **C#**
- **NUnit**
- **dotnet test** CLI
- **Page Object Model (POM)**
- **Extent Reports (HTML)**
- **NUnit-based test listeners (custom)**
- **Headless & browser configuration via properties file**

Recommended IDE: **Visual Studio / Rider / VS Code with C# Dev Kit**

---

### 🛠 Prerequisites

- **.NET SDK 8+** (or newer that supports `net10.0`)
- Chrome (and optionally Firefox) installed

Verify .NET SDK:

```bash
dotnet --version
```

---

### 📁 Project Structure

```text
selenium-csharp
│
├── Base
│   ├── BaseTest.cs            # Common setup/teardown & driver lifecycle
│   ├── ConfigReader.cs        # Reads Config/application.properties
│   └── WebDriverFactory.cs    # Central WebDriver creation logic
│
├── Config
│   └── application.properties # Browser, URL, timeouts, window size, etc.
│
├── Listeners
│   └── TestListener.cs        # Orchestrates reporting per test run & test
│
├── Pages
│   ├── BasePage.cs            # Base Page Object
│   └── ApplicationPage.cs     # Sample page object
│
├── Reporting
│   └── ExtentReportManager.cs # ExtentReports initialization & logging
│
├── Tests
│   └── ApplicationTests.cs    # Sample NUnit test class (tagged with categories)
│
├── Utils
│   ├── ConstantUtils.cs       # Constants (config path, width/height keys, etc.)
│   ├── HelperUtils.cs         # Generic helpers
│   ├── LoggerUtil.cs          # Simple logging wrapper
│   └── SynchronizationUtils.cs# Explicit wait helpers
│
├── Readme.md
└── selenium-csharp.csproj
```

---

### ⚙ Framework Architecture

#### 🔹 Base
- **`BaseTest`** – sets up and tears down WebDriver, integrates with the `TestListener`.
- **`WebDriverFactory`** – creates and manages the singleton WebDriver and `WebDriverWait` instances.
- **`ConfigReader`** – reads values from `Config\application.properties`.

#### 🔹 Pages
- Implements the **Page Object Model**.
- `BasePage` holds shared driver/wait references.
- `ApplicationPage` is a sample page to extend with real locators and actions.

#### 🔹 Utils
- `ConstantUtils` – constants (config file path, width/height keys, etc.).
- `HelperUtils` – reusable helpers.
- `LoggerUtil` – simple logging via `System.Diagnostics.Trace`.
- `SynchronizationUtils` – explicit wait wrappers for common element conditions.

#### 🔹 Reporting
- `ExtentReportManager` – sets up ExtentReports using `ExtentSparkReporter`.
- Creates timestamped HTML reports in a `Reports` folder under the test output directory.
- Only logs **pass / fail** entries per test (no verbose info entries).

#### 🔹 Listeners
- `TestListener` – main orchestration for reporting:
  - `OnRunStart` / `OnRunFinish` – initializes and flushes the Extent report for the run.
  - `OnTestStart` – creates a test node for each NUnit test.
  - `OnTestFinish` – logs **pass** or **fail** status based on `TestContext`.

#### 🔹 Tests
- `ApplicationTests` – example test class demonstrating:
  - Inheritance from `BaseTest`.
  - Use of categories (tags) like `"smoke"` and `"ui"`.

---

### 🔧 Browser & Headless Configuration

Configuration is driven by:

```text
Config/application.properties
```

Example:

```properties
BASE_URL=https://example.com
BROWSER=chrome
IMPLICIT_WAIT_IN_SEC=10
WIDTH=1280
HEIGHT=720
HEADLESS=false
INCOGNITO=false
FIREFOX_DRIVER_PATH=geckodriver.exe
```

Notes:
- `BROWSER` – currently supports `chrome` and `firefox` in `WebDriverFactory`.
- `HEADLESS` – when `true`, runs browser in headless mode.
- `INCOGNITO` – launches browser in private/incognito mode where supported.

---

### ▶ Running Tests from IDE

1. Open the `selenium-csharp` project in your preferred .NET IDE.
2. Restore NuGet packages (usually automatic on build).
3. Locate `Tests/ApplicationTests.cs`.
4. Right-click the test class or a specific test method and choose **Run**.

The Extent HTML report will be generated under:

```text
selenium-csharp/bin/Debug/net10.0/Reports/
```

Open the latest `ExtentReport_*.html` file in a browser.

---

### 💻 Running Tests from Terminal

Open a terminal in the `selenium-csharp` project folder (where `selenium-csharp.csproj` exists).

#### 1️⃣ Run All Tests

```bash
dotnet test
```

#### 2️⃣ Run Tests by Category (Tag)

Categories are defined using `[Category("name")]` attributes in NUnit.

Examples:

- Run all **smoke** tests:

```bash
dotnet test --filter "TestCategory=smoke"
```

- Run all **UI** tests:

```bash
dotnet test --filter "TestCategory=ui"
```

You can combine filters as needed using `&` / `|`.

---

### 📊 Reports

#### Extent HTML Reports

Reports are generated to a dedicated `Reports` folder inside the output directory, for example:

```text
selenium-csharp/bin/Debug/net10.0/Reports/ExtentReport_YYYYMMDD_HHMMSS.html
```

Each test run creates a new timestamped HTML file containing:
- One entry per test.
- Only **pass** or **fail** status (no extra info logs).

Open the HTML file in a browser to review the results.

---

### 🔄 Test Execution Flow

1. NUnit discovers tests in the `Tests` namespace.
2. `BaseTest` `OneTimeSetUp` calls `TestListener.OnRunStart` → initializes report.
3. For each test:
   - `SetUp` creates the driver, opens the `BASE_URL`, and calls `OnTestStart`.
   - Test logic runs using Page Objects.
   - `TearDown` calls `OnTestFinish`, logging pass/fail, then closes the browser.
4. After all tests, `OneTimeTearDown` calls `OnRunFinish` → flushes the Extent report.

---

### 🧩 Tech Stack

| Component | Value        |
|----------|--------------|
| Language | C#           |
| Target   | .NET `net10.0` |
| Test     | NUnit        |
| UI       | Selenium 4.x |
| Reports  | ExtentReports 5.x |

---

### 🚀 Quick Commands

| Action                 | Command                                      |
|------------------------|----------------------------------------------|
| Run all tests          | `dotnet test`                               |
| Run smoke tests        | `dotnet test --filter "TestCategory=smoke"` |
| Run UI tests           | `dotnet test --filter "TestCategory=ui"`    |

---

