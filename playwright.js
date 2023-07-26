const { chromium } = require("playwright");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const doc_viz = process.env.DOC_VIZ;
const login = process.env.LOGIN;
const user = process.env.USER;
const pass = process.env.PASS;

async function openWebPage() {
  try {
    var dir = path.join(__dirname, "pdf");
    const browser = await chromium.launch({
      headless: false,
      slowMo: 50,
    });

    const context = await browser.newContext({
      acceptDownloads: true,
      downloadsPath: dir,
    });

    const page = await context.newPage();

    await page.goto(login);

    await page.fill("#usu_login", user);
    await page.fill("#password", pass);

    await Promise.all([
      //   page.waitForNavigation(),
      page.click("input[type=submit]"),
    ]);

    for (let i = 2; i <= 1551; i++) {
      const vizPage = await context.newPage();
      await vizPage.goto(`${doc_viz}${i}`);

      const title = await vizPage.$eval(".class_nombre", (el) =>
        el ? el.innerText : null
      );
      console.log(title);

      await vizPage.evaluate(() => {
        const iframe = document.querySelector("iframe");
        console.log(iframe);
        if (!iframe) {
          return null;
        } else {
          iframe.contentWindow.document.getElementById("download").click();
        }
      });

      await vizPage.close();
    }

    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

openWebPage();
