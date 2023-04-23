import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import puppeteer from "puppeteer";
import pLimitDefault from "p-limit";

@Injectable()
export class ScraperService {
  @Cron("0 0 * * *")
  async scheduledScraping() {
    // 按照任务执行
    // 调用您的爬虫方法，例如：await this.scrapeTargetPage(url);

  }

  async startJob() {

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins"
      ]
    });

    const productUrls = [
      /*iDOO 8Pods*/
      "https://www.amazon.com/dp/B0B6R2XNLS",
      /* iDOO 12 Pods */
      "https://www.amazon.com/dp/B08DLMRKHM",
      /*inBloom*/
      "https://www.amazon.com/dp/B0B9BHHYKB",
      /*Random TrashBin*/
      "https://www.amazon.com/dp/B09KZPSRL2",
      /* Porch Sign B0BWXN845R */
      "https://www.amazon.com/dp/B0BWXN845R"
      // ... 更多产品链接
    ];

    // const limit = pLimitDefault(2); // 限制同时进行的页面数量为2

    const results = await Promise.all(
      productUrls.map(async (url) => {
        // return limit(async () => {
        return await this.scrapeProductDetail(url, browser);
        // });
      })
    );

    console.log(results);

    await browser.close();

  }

  async scrapeProductDetail(url, browser, maxRetries = 3) {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const page = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
        );
        await page.setExtraHTTPHeaders({
          "Accept-Language": "en-US,en;q=0.9"
        });

        await page.goto(url, { timeout: 60000 });

        // ... 此处是你的爬虫代码 ...
        const pricingResult = await this.#scrapePricingDetail(page);
        const rankingResult = await this.#scrapeRankingDetail(page);

        await page.close();

        console.log(`URL is ${url}`);
        console.log(`Is Deal: ${pricingResult.isDeal}`);
        console.log(`To Pay Price: ${pricingResult.priceToPay}`);
        console.log(`Basis Price: ${pricingResult.basisPrice}`);
        console.log(`Has Coupon: ${pricingResult.hasCoupon}`);
        console.log(`discount: ${pricingResult.discount}`);
        console.log(`discount type: ${pricingResult.discountType}`);

        return {
          // 返回你想要的数据结构
        };
      } catch (error) {
        console.log(`Error fetching data for ${url}: ${error.message}`);
        retries++;
        console.log(`Retrying (${retries}/${maxRetries}) for ${url}`);
      }
    }

    console.log(`Failed to fetch data for ${url} after ${maxRetries} retries.`);
    return null;
  }

  async #scrapePricingDetail(page) {

    await page.waitForSelector("#apex_desktop");

    /**
     * Scrape Deal Badge
     */
    const isDeal = await page.$$eval("#dealBadge_feature_div span", (elements) => {
      return elements.some(element => element.textContent.trim() === "Deal");
    });

    /**
     * Scrape the Prices
     */
    const priceData = await page.evaluate(() => {
      const priceToPayElement = document.querySelector("#corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen");
      const basisPriceElement = document.querySelector("#corePriceDisplay_desktop_feature_div .basisPrice .a-offscreen");

      const priceToPay = priceToPayElement ? parseFloat((priceToPayElement as HTMLElement).innerText.replace("$", "").trim()) : -1;
      const basisPrice = basisPriceElement ? parseFloat((basisPriceElement as HTMLElement).innerText.replace("$", "").trim()) : -1;


      return {
        priceToPay,
        basisPrice
      };
    });

    /**
     * Scrape Coupon
     */
    const couponInfo = await page.evaluate(() => {
      const couponElement = document.querySelector("#promoPriceBlockMessage_feature_div .promoPriceBlockMessage");

      let hasCoupon = false;
      let discount = 0;
      let discountType = "";

      if (couponElement) {
        // const percentageMatch = couponElement.innerText.match(/Apply\s+(\d+)%\s+coupon/);
        // const dollarMatch = couponElement.innerText.match(/Apply\s+\$([\d.]+)\s+coupon/);
        const percentageMatch = (couponElement as HTMLElement).innerText.match(/Apply\s+(\d+)%\s+coupon/);
        const dollarMatch = (couponElement as HTMLElement).innerText.match(/Apply\s+\$([\d.]+)\s+coupon/);

        if (percentageMatch && percentageMatch[1]) {
          hasCoupon = true;
          discount = parseFloat(percentageMatch[1]);
          discountType = "percentage";
        } else if (dollarMatch && dollarMatch[1]) {
          hasCoupon = true;
          discount = parseFloat(dollarMatch[1]);
          discountType = "dollar";
        }
      }

      return {
        hasCoupon,
        discount,
        discountType
      };
    });

    return {
      isDeal: isDeal,
      priceToPay: priceData.priceToPay,
      basisPrice: priceData.basisPrice,
      hasCoupon: couponInfo.hasCoupon,
      discount: couponInfo.discount,
      discountType: couponInfo.discountType
    };
  }

  async #scrapeRankingDetail(page) {
    const productDetail = await page.waitForSelector("#prodDetails");

    return await productDetail.$$eval("th", (elements) => {
      for (let element of elements) {
        if (element.textContent.includes("Best Sellers Rank")) {

          const rankText = element.nextElementSibling.querySelector("span").textContent;

          console.log(rankText);

          // 使用正则表达式提取数据
          const rankMatch = rankText.match(/#([\d,]+)\s+in\s+(.+?)\s+\(/);
          const rank = parseInt(rankMatch[1].replace(/,/g, ""), 10);
          const category = rankMatch[2];

          const subRankText = rankText.match(/#.*#(\d+) in (.*)/);
          const subRank = parseInt(subRankText[1].replace(/,/g, ""), 10);
          const subCategory = subRankText[2].trim();

          return { rank, category, subRank, subCategory };
        }
      }
    });
  }

}
