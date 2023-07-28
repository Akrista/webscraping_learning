const puppeteer = require("puppeteer-extra");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
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
      slowMo: 25,
    });

    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    await page.goto(login);

    await page.type("#usu_login", user);
    await page.type("#password", pass);

    await page.click("input[type=submit]");

    await page.close();

    for (let i = 488; i <= 2000; i++) {
      const vizPage = await browser.newPage();
      await vizPage.setDefaultNavigationTimeout(0);
      const visitUrl = `${doc_viz}${i}`;
      await vizPage.goto(visitUrl);

      const title = await vizPage.evaluate(() => {
        const title = document.querySelector(".class_nombre");
        if (!title) {
        } else {
          return title.innerText;
        }
      });
      await vizPage.evaluate(() => {
        const iframe = document.querySelector("iframe");
        if (!iframe) {
        } else {
          iframe.contentWindow.document.getElementById("download").click();
        }
      });

      await vizPage.waitForTimeout(2000);

      while (
        fs.readdirSync(dir).filter((x) => x.includes(".crdownload")).length > 0
      ) {
        await vizPage.waitForTimeout(5000);
      }

      const files = fs.readdirSync(dir);
      if (files.length === 1 || !oldFiles) {
        fs.renameSync(
          `${dir}/${files[files.length - 1]}`,
          `${dir}/${i}.${title.replace(/\s|\//g, "_")}.pdf`
        );
        var oldFiles = fs.readdirSync(dir);
      } else if (
        files.length === 0 ||
        files.filter((x) => !oldFiles.includes(x)).length === 0
      ) {
      } else {
        var newFiles = files.filter((x) => !oldFiles.includes(x));
        fs.renameSync(
          `${dir}/${newFiles[0]}`,
          `${dir}/${i}.${title.replace(/\s|\//g, "_")}.pdf`
        );
        oldFiles = fs.readdirSync(dir);
      }

      const pages = await browser.pages();
      for (let i = 2; i < pages.length; i++) {
        await pages[i].close();
      }
    }

    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

openWebPage();
