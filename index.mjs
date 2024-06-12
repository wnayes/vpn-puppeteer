import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--window-size=800,700`],
    timeout: 0,
  });
  const [page] = await browser.pages();

  const [, , site, email] = process.argv;

  await page.goto(site);
  await page.bringToFront(); // Put focus into document.

  if (email) {
    const emailInputHandle = await page.waitForSelector("input[type='email']");
    await emailInputHandle.type(email);

    const submitInputHandle = await page.waitForSelector(
      "input[type='submit']"
    );
    await submitInputHandle.click();
  }

  let webvpnCookie;
  await page.waitForResponse(
    (response) => {
      const headers = response.headers();
      const setCookies = headers["set-cookie"]?.split("\n");
      if (setCookies) {
        const webvpnLine = setCookies.find((cookieLine) =>
          cookieLine.startsWith("webvpn=")
        );
        if (webvpnLine) {
          webvpnCookie = webvpnLine.substring(
            "webvpn=".length,
            webvpnLine.indexOf(";")
          );
          return true;
        }
      }
      return false;
    },
    {
      timeout: 0,
    }
  );

  if (webvpnCookie) {
    console.log(webvpnCookie);
  }

  await browser.close();
})();
