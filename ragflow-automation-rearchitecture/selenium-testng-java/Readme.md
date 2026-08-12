# Selenium + TestNG Automation Framework

## 📌 Overview

This is a Selenium automation framework built using:

- Java 17
- TestNG
- Maven 4.x
- Page Object Model (POM)
- Extent Reports
- Logback Logging
- TestNG Listeners
- Headless & Browser configuration via properties file

IDE Recommended: IntelliJ IDEA

---

# 🛠 Prerequisites

## 1️⃣ Java 17

Verify Java version:

```bash
java -version
```

Output should show:

```
openjdk version "17"
```

---

## 2️⃣ IntelliJ IDEA

Recommended IDE:

IntelliJ IDEA

Open the project directly in IntelliJ.

---

## 3️⃣ Maven 4.x

Verify Maven:

```bash
mvn -version
```

Output should show:

```
Apache Maven 4.x
Java version: 17
```

---

# 📁 Project Structure

```
project-root
│
├── src
│   ├── main
│   │   ├── java
│   │   │   └── org.zemoso
│   │   │       ├── base
│   │   │       │   ├── BaseTest
│   │   │       │   ├── ConfigReader
│   │   │       │   └── WebDriverFactory
│   │   │       │
│   │   │       ├── pages
│   │   │       │   ├── BasePage
│   │   │       │   └── ApplicationPage
│   │   │       │
│   │   │       ├── report
│   │   │       │   └── ExtentReportManager
│   │   │       │
│   │   │       └── utils
│   │   │           ├── ConstantUtils
│   │   │           ├── HelperUtils
│   │   │           ├── LoggerUtil
│   │   │           ├── ReportUtil
│   │   │           └── SynchronizationUtils
│   │   │
│   │   └── resources
│   │       ├── application.properties
│   │       └── logback.xml
│   │
│   └── test
│       └── java
│           └── org.zemoso
│               ├── listener
│               │   ├── ReportListener
│               │   └── TestListener
│               │
│               └── tests
│                   └── ApplicationTest
│
├── target
├── pom.xml
└── testing.xml
```

---

# ⚙ Framework Architecture

## 🔹 base
- BaseTest → Setup & Teardown
- WebDriverFactory → Driver creation logic
- ConfigReader → Reads properties file

## 🔹 pages
- Page Object Model implementation

## 🔹 utils
- Wait handling
- Logging
- Constants
- Helper methods

## 🔹 report
- Extent report setup

## 🔹 listener
- TestNG listeners for reporting & logging

---

# 🔧 Browser & Headless Configuration

Browser and headless execution are controlled via:

```
src/main/resources/application.properties
```

## Example configuration:

```properties
BROWSER=chrome
BASE_URL=https://example.com
HEADLESS=false
IMPLICIT_WAIT_IN_SEC=5
WIDTH=1920
HEIGHT=1080

```

### Supported Browsers:
- chrome
- edge
- firefox

### Headless Execution:
```
headless=true
```

WebDriverFactory reads these properties and launches the browser accordingly.

---

# ▶ Running Tests from IntelliJ

## Run Entire Suite

1. Open `testing.xml`
2. Right-click
3. Click **Run 'testing.xml'**

---

## Run Single Test Class

Navigate to:

```
src/test/java/org/zemoso/tests/ApplicationTest.java
```

Right-click → Run ApplicationTest

---

# 💻 Running Tests from Terminal

Open terminal at project root (where `pom.xml` exists).

---

## 1️⃣ Run Complete Suite

Ensure `pom.xml` contains Surefire configuration:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.5</version>
            <configuration>
                <suiteXmlFiles>
                    <suiteXmlFile>testing.xml</suiteXmlFile>
                </suiteXmlFiles>
            </configuration>
        </plugin>
    </plugins>
</build>
```

Run:

```bash
mvn clean test
```

---

## 2️⃣ Run Specific Test Class

```bash
mvn -Dtest=ApplicationTest test
```

---

## 3️⃣ Run Specific Test Method

```bash
mvn -Dtest=ApplicationTest#methodName test
```

Example:

```bash
mvn -Dtest=ApplicationTest#verifyApplicationLaunch test
```

---

# 📊 Reports

## Surefire Reports
```
target/surefire-reports/
```

## Extent Reports
```
reports/
```

Open the generated HTML report in browser.

---

# 🧾 Logging

Configured in:

```
src/main/resources/logback.xml
```

Handles:
- Log level
- Console logging
- File logging

---

# 🔄 Test Execution Flow

1. `testing.xml` triggers TestNG
2. Listeners are initialized
3. BaseTest runs setup
4. WebDriverFactory creates driver
5. Test executes
6. Report is generated
7. Driver closes in teardown

---

# 🧩 Tech Stack

| Component | Version |
|-----------|----------|
| Java | 17 |
| Maven | 4.x |
| TestNG | Latest |
| Selenium | 4.x |
| IDE | IntelliJ |

---

# ✅ Key Features

- Page Object Model
- Extent Reporting
- TestNG Listeners
- Logback Logging
- Headless Execution Support
- Property-based Browser Selection
- Maven CLI Execution Support

---

# 🚀 Quick Commands

| Action | Command |
|--------|----------|
| Run full suite | `mvn clean test` |
| Run class | `mvn -Dtest=ApplicationTest test` |
| Run method | `mvn -Dtest=ApplicationTest#methodName test` |

---
