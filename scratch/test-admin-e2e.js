import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\kiran\\.gemini\\antigravity-ide\\brain\\231cc857-445c-4276-a3b0-b0a4cf230894';

async function run() {
  console.log('--- STARTING E2E ADMIN AUTH & SLOT MANAGER VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Direct unauthenticated visit to /#/admin/slots
  console.log('1. Attempting unauthenticated access to /#/admin/slots...');
  await page.goto('http://localhost:5173/#/admin/slots', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const urlAfterDirect = page.url();
  console.log('Current URL after direct visit:', urlAfterDirect);

  const headingText = await page.$eval('h1', el => el.textContent.trim()).catch(() => '');
  console.log('Heading on page:', headingText);

  if (!urlAfterDirect.includes('/admin/login') || !headingText.toUpperCase().includes('ADMIN LOGIN')) {
    console.error('FAILED: Unauthenticated user was not redirected to Admin Login!');
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Direct access blocked, redirected to Admin Login.');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_login_page.png') });

  // 2. Test Invalid Credentials
  console.log('2. Testing invalid credentials...');
  await page.type('#admin-login-username', 'admin');
  await page.type('#admin-login-password', 'wrongpass123');
  await page.click('#btn-admin-login-submit');
  await new Promise(r => setTimeout(r, 600));

  const errorBanner = await page.$eval('#admin-login-alert-text', el => el.textContent.trim()).catch(() => '');
  console.log('Error banner text:', errorBanner);
  if (!errorBanner.includes('Invalid username or password')) {
    console.error('FAILED: Expected "Invalid username or password." banner, got:', errorBanner);
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Invalid login showed proper error banner.');

  // 3. Test Show/Hide Password
  console.log('3. Testing show/hide password toggle...');
  const inputTypeBefore = await page.$eval('#admin-login-password', el => el.type);
  await page.click('#btn-toggle-password');
  const inputTypeAfter = await page.$eval('#admin-login-password', el => el.type);
  await page.click('#btn-toggle-password');
  const inputTypeFinal = await page.$eval('#admin-login-password', el => el.type);
  console.log(`Password input type toggle: ${inputTypeBefore} -> ${inputTypeAfter} -> ${inputTypeFinal}`);
  if (inputTypeBefore !== 'password' || inputTypeAfter !== 'text' || inputTypeFinal !== 'password') {
    console.error('FAILED: Password visibility toggle failed!');
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Password toggle works.');

  // 4. Test Valid Credentials & Login
  console.log('4. Testing valid credentials (admin / admin123)...');
  await page.evaluate(() => {
    document.getElementById('admin-login-password').value = '';
  });
  await page.type('#admin-login-password', 'admin123');
  await page.click('#btn-admin-login-submit');

  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1200));

  const urlAfterLogin = page.url();
  console.log('URL after successful login:', urlAfterLogin);
  if (!urlAfterLogin.includes('/admin/slots')) {
    console.error('FAILED: Did not redirect to /admin/slots after login. Current URL:', urlAfterLogin);
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Successfully logged in and redirected to Admin Slot Manager.');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin_slots_dashboard.png') });

  // 5. Verify Navigation Links
  const navTexts = await page.$$eval('.admin-nav-btn', btns => btns.map(b => b.textContent.trim()));
  console.log('Admin navigation tabs:', navTexts);

  // 6. Test "+ Add Slot" Button & Modal
  console.log('6. Clicking "+ Add Slot" button...');
  const addSlotBtn = await page.$('#btn-admin-add-slot');
  if (!addSlotBtn) {
    console.error('FAILED: #btn-admin-add-slot not found in DOM!');
    await browser.close();
    process.exit(1);
  }
  await addSlotBtn.click();
  await new Promise(r => setTimeout(r, 600));

  const modalTitle = await page.$eval('#modal-add-slot-title', el => el.textContent.trim()).catch(() => '');
  console.log('Modal title:', modalTitle);
  if (!modalTitle.includes('Add New Slot')) {
    console.error('FAILED: Modal title not found or incorrect:', modalTitle);
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Add New Slot modal opened.');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'add_slot_modal_opened.png') });

  // 7. Fill and Submit Add Slot Form
  console.log('7. Filling and submitting new slot form...');
  // Select time 03:00 PM - 04:00 PM
  await page.evaluate(() => {
    const timeSelect = document.getElementById('inp-slot-time-select');
    if (timeSelect) {
      timeSelect.value = '15:00 - 16:00';
      timeSelect.dispatchEvent(new Event('change'));
    }
  });

  const submitSlotBtn = await page.$('#btn-submit-add-slot');
  if (!submitSlotBtn) {
    console.error('FAILED: Submit slot button not found!');
    await browser.close();
    process.exit(1);
  }
  await submitSlotBtn.click();
  await new Promise(r => setTimeout(r, 1500));

  // Check if slot table contains the slot
  const tableContent = await page.$eval('.p-table', el => el.textContent).catch(() => '');
  console.log('Table contains new slot (03:00 PM)?', tableContent.includes('03:00 PM'));
  if (!tableContent.includes('03:00 PM')) {
    console.error('FAILED: Newly created slot does not appear in table!');
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Newly created slot saved to backend and rendered in table!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'slot_added_in_table.png') });

  // 8. Test Admin Logout & Route Protection
  console.log('8. Testing Admin Logout...');
  const logoutBtn = await page.$('#btn-admin-signout');
  if (!logoutBtn) {
    console.error('FAILED: Logout button not found!');
    await browser.close();
    process.exit(1);
  }
  await logoutBtn.click();
  await new Promise(r => setTimeout(r, 800));

  const urlAfterLogout = page.url();
  console.log('URL after logout:', urlAfterLogout);
  if (!urlAfterLogout.includes('/admin/login')) {
    console.error('FAILED: Not redirected to Admin Login after logout!');
    await browser.close();
    process.exit(1);
  }

  // Attempt to navigate back or direct access to /#/admin/slots after logout
  console.log('Attempting direct access to /#/admin/slots after logout...');
  await page.goto('http://localhost:5173/#/admin/slots', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const urlAfterPostLogoutAttempt = page.url();
  console.log('URL after attempting direct access:', urlAfterPostLogoutAttempt);
  if (!urlAfterPostLogoutAttempt.includes('/admin/login')) {
    console.error('FAILED: Protected route allowed access after logout!');
    await browser.close();
    process.exit(1);
  }
  console.log('SUCCESS: Direct access blocked after logout.');

  await browser.close();
  console.log('=== ALL E2E TESTS PASSED SUCCESSFULLY! ===');
}

run().catch(err => {
  console.error('E2E Test Exception:', err);
  process.exit(1);
});
