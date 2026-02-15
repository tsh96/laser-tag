const { chromium } = require('playwright');

// Auto-detected dev server
const TARGET_URL = 'http://localhost:5173';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🚀 Navigating to LaserTag PWA...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: '/tmp/lasertag-auth-loaded.png', fullPage: true });

    const title = await page.title();
    console.log('📄 Page title:', title);

    // Check for sign-in form
    const signInButton = await page.locator('button:has-text("Sign in")').first().isVisible().catch(() => false);
    
    if (signInButton) {
      console.log('🔐 Found sign-in form, creating test account...');
      
      // Fill in test credentials
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.screenshot({ path: '/tmp/lasertag-auth-filled.png', fullPage: true });
      
      // Click create account button
      console.log('📝 Creating account...');
      await page.locator('button:has-text("Create account")').click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '/tmp/lasertag-after-signup.png', fullPage: true });
    }

    // Now check for the rich text editor
    console.log('🔍 Looking for Rich Text Mode...');
    await page.waitForTimeout(2000);
    
    // Wait for the editor to be visible
    await page.waitForSelector('.panel-title:has-text("Editor")', { timeout: 10000 }).catch(() => null);
    
    await page.screenshot({ path: '/tmp/lasertag-editor-page.png', fullPage: true });
    
    const richTextCheckbox = await page.locator('text=Rich Text Mode').isVisible().catch(() => false);
    
    if (richTextCheckbox) {
      console.log('✅ Found Rich Text Mode checkbox');
      
      // Check if it's already enabled
      const checkbox = page.locator('label:has-text("Rich Text Mode") input[type="checkbox"]');
      const isChecked = await checkbox.isChecked();
      console.log('📝 Rich Text Mode is:', isChecked ? 'enabled' : 'disabled');
      
      if (!isChecked) {
        console.log('🔄 Enabling Rich Text Mode...');
        await page.locator('text=Rich Text Mode').click();
        await page.waitForTimeout(1000);
      }

      await page.screenshot({ path: '/tmp/lasertag-richtext-enabled.png', fullPage: true });

      // Check if rich text editor is visible
      const editor = page.locator('.editor-content').first();
      const isEditorVisible = await editor.isVisible();
      console.log('📝 Rich text editor visible:', isEditorVisible);

      if (isEditorVisible) {
        console.log('🖊️ Testing rich text editor...');
        
        // Click into the editor
        await editor.click();
        await page.waitForTimeout(500);
        
        // Clear and type new text
        await page.keyboard.press('Control+A');
        await page.keyboard.type('Hello Rich Text Editor!');
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-typed-text.png', fullPage: true });
        
        // Test Bold button
        console.log('🔨 Testing Bold formatting...');
        await page.keyboard.press('Control+A');
        await page.locator('.toolbar-btn[title="Bold"]').click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-bold-text.png', fullPage: true });
        
        // Test Italic button
        console.log('✏️ Testing Italic formatting...');
        await page.locator('.toolbar-btn[title="Italic"]').click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-bold-italic.png', fullPage: true });
        
        // Test font family
        console.log('🎨 Testing Font Family...');
        await page.locator('select[title="Font Family"]').selectOption('Georgia');
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-georgia-font.png', fullPage: true });
        
        // Test font size
        console.log('📏 Testing Font Size...');
        await page.locator('select[title="Font Size"]').selectOption('36');
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-large-font.png', fullPage: true });
        
        // Test underline
        console.log('📑 Testing Underline...');
        await page.locator('.toolbar-btn[title="Underline"]').click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-underline.png', fullPage: true });
        
        // Test strikethrough
        console.log('〰️ Testing Strikethrough...');
        await page.locator('.toolbar-btn[title="Strikethrough"]').click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: '/tmp/lasertag-strikethrough.png', fullPage: true });
        
        // Check the canvas preview
        console.log('🖼️ Checking canvas preview...');
        const canvas = page.locator('canvas').first();
        const canvasVisible = await canvas.isVisible();
        console.log('Canvas preview visible:', canvasVisible);
        
        await page.screenshot({ path: '/tmp/lasertag-final-preview.png', fullPage: true });
        
        console.log('✅ All rich text editor tests completed successfully!');
        console.log('📸 Screenshots saved to /tmp/lasertag-*.png');
      } else {
        console.log('⚠️ Rich text editor not visible');
      }
    } else {
      console.log('⚠️ Rich Text Mode checkbox not found');
      
      // Check what's on the page
      const bodyText = await page.textContent('body');
      console.log('Page contains:', bodyText.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    await page.screenshot({ path: '/tmp/lasertag-error.png', fullPage: true });
  } finally {
    console.log('🏁 Closing browser...');
    await browser.close();
  }
})();
