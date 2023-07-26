const puppeteer = require("puppeteer-extra");
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
    puppeteer.use(
      require("puppeteer-extra-plugin-user-preferences")({
        userPrefs: {
          download: {
            prompt_for_download: false,
            // open_pdf_in_system_reader: true,
            default_directory: dir,
          },
          // plugins: {
          //   always_open_pdf_externally: true,
          // },
        },
      })
    );
    const browser = await puppeteer.launch({
      headless: false,
      // devtools: true,
      slowMo: 50,
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.goto(login);

    await page.type("#usu_login", user);
    await page.type("#password", pass);

    await page.click("input[type=submit]");

    await page.close();

    for (let i = 1; i <= 1551; i++) {
      const vizPage = await browser.newPage();
      await vizPage.setDefaultNavigationTimeout(0);
      const visitUrl = `${doc_viz}${i}`;
      await vizPage.goto(visitUrl);

      const title = await vizPage.evaluate(() => {
        const title = document.querySelector(".class_nombre");
        if (!title) {
          return null;
        } else {
          return title.innerText;
        }
      });
      await vizPage.evaluate(() => {
        const iframe = document.querySelector("iframe");
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
