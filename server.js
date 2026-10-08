const http = require('http');
const { chromium } = require('playwright');

const PORT = 3000;
const USER_DATA_DIR = 'D:\\shopee-browser\\chrome-profile';

let context = null;
let busy = false;

let browser = null;

async function getBrowser() {
    if (!browser) {
        browser = await chromium.connectOverCDP(
            'http://127.0.0.1:9222'
        );
    }

    return browser;
}

async function scrapeProduct(productUrl) {
    const browser = await getBrowser();

    const contexts = browser.contexts();

    if (contexts.length === 0) {
        throw new Error('Không tìm thấy Chrome context');
    }

    const context = contexts[0];

    let pages = context.pages();

    let page = pages.length
        ? pages[0]
        : await context.newPage();

    let apiResponse = null;

    const responseHandler = async (response) => {
        try {
            const url = response.url();

            if (
                url.includes('/api/v4/pdp/get_pc') &&
                response.status() === 200
            ) {
                console.log('>>> Shopee API response:', url);

                try {
                    apiResponse = await response.json();
                } catch (e) {
                    console.log('Response không phải JSON');
                }
            }
        } catch (e) {
            console.error('Response handler error:', e.message);
        }
    };

    page.on('response', responseHandler);

    try {
        console.log('Mở sản phẩm:');
        console.log(productUrl);

        await page.goto(productUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        // Chờ Shopee load API
        for (let i = 0; i < 30; i++) {
            if (apiResponse) break;

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!apiResponse) {
            throw new Error(
                'Không bắt được /api/v4/pdp/get_pc sau 30 giây'
            );
        }

        return apiResponse;

    } finally {
        page.off('response', responseHandler);
    }
}

async function createAffiliateLink(productUrl) {
  const browser = await getBrowser();

  const contexts = browser.contexts();

  if (!contexts.length) {
    throw new Error('Không tìm thấy Chrome context');
  }

  const context = contexts[0];

  let pages = context.pages();

  let page = pages[0];

  // ==============================
  // 1. Vào thẳng trang Custom Link
  // ==============================
  await page.goto(
    'https://affiliate.shopee.vn/offer/custom_link',
    {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    }
  );

  await page.waitForTimeout(3000);

  // ==============================
  // 2. Kiểm tra đăng nhập
  // ==============================
  if (page.url().includes('/login')) {
    throw new Error(
      'Chrome chưa đăng nhập Shopee Affiliate'
    );
  }

  // ==============================
  // 3. Tìm ô nhập Product URL
  // ==============================
  const textarea = page.locator('textarea:visible').first();

  await textarea.waitFor({
    state: 'visible',
    timeout: 15000
  });

  // Xóa nội dung cũ
  await textarea.fill('');

  // Điền Product URL
  await textarea.fill(productUrl);

  console.log('Đã nhập Product URL:', productUrl);

  // ==============================
  // 4. Click "Lấy link"
  // ==============================
  const getLinkButton = page.locator(
    'button.ant-btn.ant-btn-primary[type="submit"]'
  ).filter({
    hasText: 'Lấy link'
  });

  await getLinkButton.waitFor({
    state: 'visible',
    timeout: 10000
  });

  await getLinkButton.click();

  console.log('Đã click Lấy link');

  // ==============================
  // 5. Chờ Shopee tạo link
  // ==============================
  await page.waitForTimeout(2000);

  // ==============================
  // 6. Lấy link trong popup
  // ==============================
  const modalTextarea = page.locator(
    'textarea:visible'
  ).last();

  await modalTextarea.waitFor({
    state: 'visible',
    timeout: 10000
  });

  const affiliateUrl = await modalTextarea.inputValue();

  console.log(
    'Affiliate URL:',
    affiliateUrl
  );

  if (
    !affiliateUrl ||
    !affiliateUrl.startsWith('http')
  ) {
    throw new Error(
      `Affiliate URL không hợp lệ: ${affiliateUrl}`
    );
  }

  return affiliateUrl;
}

function sendJson(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8'
    });

    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        return sendJson(res, 200, {
            ok: true,
            service: 'shopee-playwright'
        });
    }

    // Scrape
    if (req.method === 'POST' && req.url === '/scrape') {

        if (busy) {
            return sendJson(res, 429, {
                error: 'Browser đang xử lý request khác'
            });
        }

        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {

            busy = true;

            try {
                const data = JSON.parse(body);

                if (!data.url) {
                    return sendJson(res, 400, {
                        error: 'Thiếu url'
                    });
                }

                console.log('\n==============================');
                console.log('SCRAPE');
                console.log(data.url);
                console.log('==============================');

                const result = await scrapeProduct(data.url);

                sendJson(res, 200, {
                    success: true,
                    product_url: data.url,
                    data: result
                });

            } catch (error) {

                console.error(error);

                sendJson(res, 500, {
                    success: false,
                    error: error.message
                });

            } finally {
                busy = false;
            }
        });

        return;
    }

    if (req.method === 'POST' && req.url === '/affiliate-link') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            try {
            const data = JSON.parse(body);

            if (!data.url) {
                throw new Error('Thiếu url');
            }

            const affiliateUrl = await createAffiliateLink(data.url);

            res.writeHead(200, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                success: true,
                product_url: data.url,
                affiliate_url: affiliateUrl
            }));

            } catch (error) {
            console.error(error);

            res.writeHead(500, {
                'Content-Type': 'application/json'
            });

            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
            }
        });

        return;
        }

    sendJson(res, 404, {
        error: 'Not found'
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('=================================');
    console.log('Shopee Playwright Server');
    console.log('=================================');
    console.log(`Port: ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log('');
});