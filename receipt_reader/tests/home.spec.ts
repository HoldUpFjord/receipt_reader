import { test, expect, Page } from '@playwright/test';
type ARIARole = 
  | "alert" 
  | "alertdialog" 
  | "application" 
  | "article" 
  | "banner" 
  | "blockquote" 
  | "button" 
  | "caption" 
  | "cell" 
  | "checkbox" 
  | "code" 
  | "columnheader" 
  | "combobox" 
  | "complementary" 
  | "contentinfo" 
  | "definition" 
  | "dialog" 
  | "directory" 
  | "document" 
  | "feed" 
  | "figure" 
  | "form" 
  | "grid" 
  | "gridcell" 
  | "group" 
  | "heading" 
  | "img" 
  | "link" 
  | "list" 
  | "listbox" 
  | "listitem" 
  | "log" 
  | "main" 
  | "marquee" 
  | "math" 
  | "menu" 
  | "menubar" 
  | "menuitem" 
  | "menuitemcheckbox" 
  | "menuitemradio" 
  | "navigation" 
  | "none" 
  | "note" 
  | "option" 
  | "presentation" 
  | "progressbar" 
  | "radio" 
  | "radiogroup" 
  | "region" 
  | "row" 
  | "rowgroup" 
  | "rowheader" 
  | "scrollbar" 
  | "search" 
  | "searchbox" 
  | "separator" 
  | "slider" 
  | "spinbutton" 
  | "status" 
  | "switch" 
  | "tab" 
  | "table" 
  | "tablist" 
  | "tabpanel" 
  | "term" 
  | "textbox" 
  | "timer" 
  | "toolbar" 
  | "tooltip" 
  | "tree" 
  | "treegrid" 
  | "treeitem";

// Utility function to upload a file
async function uploadFile(page: Page, label: string, filePath: string): Promise<void> {
    await page.getByLabel(label).click();
    await page.getByLabel(label).setInputFiles(filePath);
  }
  
  // Utility function to click a button by its role and name
  async function clickButton(page: Page, role: ARIARole, name: string): Promise<void> {
    await page.getByRole(role, { name }).click();
  }
  

// Main test case
test('test file upload and download', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:3000/');
    // Mock the API response
  await page.route('/api', async route => {
    // Adjust this mock response according to what your API normally returns
    const mockResponse = {
      success: true,
      text: 'Q\n' +
      '- v\n' +
      'GROCERY\n' +
      '2 QTY FIBER ONE 5.\n' +
      'Resular Price 7.3% "005\n' +
      'i ae\n' +
      '3\n' +
      'Resslar Price 7.98 9\n' +
      'Savines 2.98\n' +
      'SPUN ZESTY DILL 2.00\n' +
      'TAX 0.58\n' +
      'xxx BALANCE 72.91\n'
  };
    
    await route.fulfill({ json: mockResponse });
  });

  // Upload the file
  await uploadFile(page, 'Picture', 'tests/fixtures/receipt_test.webp');

  // Click the 'Click me' button
  await clickButton(page, 'button', 'Click me');

  // Capture the file name text
  const fileNameElement =  page.getByText('Selected file: receipt_test.webp');
  
// Check if the element was found
if (!fileNameElement) {
    console.error('Element with text "Selected file: receipt_test.webp" not found.');
  } else {
    const fileName = await fileNameElement.textContent();
  
    // Log the captured text content for debugging
    console.log('Captured file name:', fileName);
    }  
  const fileName = await fileNameElement.textContent();

  // Assert the file name
  expect(fileName).toBe('Selected file: receipt_test.webp');

  // Right-click on the text to trigger the context menu
  await page.getByText('Click meDownloadPictureSelected file: receipt_test.webp').click({
    button: 'right'
  });

  // Wait for the download event
// Instead of using page.evaluate()
const [clickMeResponse] = await Promise.all([
  page.waitForResponse(response => response.url().includes('/api'), { timeout: 30000 }),
  page.click('button:has-text("Click me")')
]);

// Ensure the "Click me" request was successful
expect(clickMeResponse.status()).toBe(200);

// Set up the download promise
const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

// Click the native download button
await page.click('button:has-text("Download")');

// Wait for the download
const download = await downloadPromise;

// Handle the download
const path = await download.path();
console.log('Downloaded file saved to:', path);
  // Add more assertions as needed
});