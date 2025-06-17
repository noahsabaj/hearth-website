/**
 * Direct test of interactive features by accessing specific pages
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3001';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFeaturesDirectly() {
  console.log('Starting direct feature tests...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('=== TEST 1: FEEDBACK WIDGET (FeedbackDemo page) ===');
  await page.goto(`${BASE_URL}/#/feedback-demo`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  const feedbackResults = await page.evaluate(() => {
    const results = {};
    
    // Check for feedback widgets
    const widgets = document.querySelectorAll('[aria-label="Feedback section"]');
    results.widgetCount = widgets.length;
    
    // Check voting buttons
    const thumbsUp = document.querySelectorAll('[aria-label="Mark as helpful"]');
    const thumbsDown = document.querySelectorAll('[aria-label="Mark as not helpful"]');
    results.votingButtons = { up: thumbsUp.length, down: thumbsDown.length };
    
    // Check if buttons work
    if (thumbsUp.length > 0 && !thumbsUp[0].disabled) {
      const initialCount = thumbsUp[0].closest('span').nextElementSibling.textContent;
      thumbsUp[0].click();
      results.clickedThumbsUp = true;
      results.initialCount = initialCount;
    }
    
    return results;
  });
  
  console.log(`Feedback widgets found: ${feedbackResults.widgetCount}`);
  console.log(`Voting buttons - Up: ${feedbackResults.votingButtons.up}, Down: ${feedbackResults.votingButtons.down}`);
  if (feedbackResults.clickedThumbsUp) {
    console.log('✓ Successfully clicked thumbs up');
  }
  
  await sleep(1000);
  
  // Check for toast and localStorage
  const postClickResults = await page.evaluate(() => {
    const results = {};
    results.hasToast = document.querySelector('[role="alert"]') !== null;
    results.feedbackData = localStorage.getItem('hearthFeedback');
    results.voteData = localStorage.getItem('hearthVote_demo-section-1');
    
    // Check if count increased
    const thumbsUp = document.querySelector('[aria-label="Mark as helpful"]');
    if (thumbsUp) {
      results.newCount = thumbsUp.closest('span').nextElementSibling.textContent;
      results.isDisabled = thumbsUp.disabled;
    }
    
    return results;
  });
  
  console.log(`Toast notification: ${postClickResults.hasToast ? 'YES' : 'NO'}`);
  console.log(`LocalStorage feedback: ${postClickResults.feedbackData ? 'YES' : 'NO'}`);
  console.log(`LocalStorage vote: ${postClickResults.voteData || 'none'}`);
  console.log(`Button disabled after vote: ${postClickResults.isDisabled ? 'YES' : 'NO'}`);
  
  // Test negative feedback
  console.log('\nTesting negative feedback...');
  const negativeResults = await page.evaluate(() => {
    const results = {};
    const widgets = document.querySelectorAll('[aria-label="Mark as not helpful"]');
    if (widgets.length > 1 && !widgets[1].disabled) {
      widgets[1].click();
      results.clicked = true;
    }
    return results;
  });
  
  if (negativeResults.clicked) {
    await sleep(1000);
    const commentBoxResults = await page.evaluate(() => {
      const results = {};
      const commentBox = document.querySelector('[aria-label="Feedback comment"]');
      results.hasCommentBox = commentBox !== null;
      if (commentBox) {
        commentBox.value = 'Test comment';
        const submitBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent === 'Submit');
        if (submitBtn) {
          submitBtn.click();
          results.submitted = true;
        }
      }
      return results;
    });
    console.log(`Comment box appeared: ${commentBoxResults.hasCommentBox ? 'YES' : 'NO'}`);
    console.log(`Comment submitted: ${commentBoxResults.submitted ? 'YES' : 'NO'}`);
  }
  
  console.log('\n=== TEST 2: RELATED ARTICLES (Documentation page) ===');
  await page.goto(`${BASE_URL}/#/docs`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  // Scroll to middle of page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await sleep(1000);
  
  const relatedResults = await page.evaluate(() => {
    const results = {};
    
    // Look for Related Topics section
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const relatedHeading = headings.find(h => h.textContent.includes('Related'));
    results.hasRelatedSection = relatedHeading !== null;
    
    if (relatedHeading) {
      results.headingText = relatedHeading.textContent;
      // Look for cards in the parent or sibling elements
      const section = relatedHeading.closest('div') || relatedHeading.parentElement;
      const cards = section.querySelectorAll('.MuiCard-root, .MuiPaper-root');
      results.cardCount = cards.length;
      
      // Get card details
      results.cards = Array.from(cards).slice(0, 3).map(card => {
        const title = card.querySelector('h4, h5, h6');
        const description = card.querySelector('p');
        return {
          title: title ? title.textContent : 'No title',
          hasDescription: description !== null,
          hasHoverEffect: window.getComputedStyle(card).transition.includes('all')
        };
      });
    }
    
    return results;
  });
  
  console.log(`Related section found: ${relatedResults.hasRelatedSection ? 'YES' : 'NO'}`);
  if (relatedResults.hasRelatedSection) {
    console.log(`Section heading: "${relatedResults.headingText}"`);
    console.log(`Article cards found: ${relatedResults.cardCount}`);
    if (relatedResults.cards) {
      relatedResults.cards.forEach((card, i) => {
        console.log(`  Card ${i + 1}: ${card.title} (desc: ${card.hasDescription ? 'YES' : 'NO'}, hover: ${card.hasHoverEffect ? 'YES' : 'NO'})`);
      });
    }
  }
  
  console.log('\n=== TEST 3: SYNTAX THEME SWITCHER (CodeBlock Demo) ===');
  await page.goto(`${BASE_URL}/#/codeblock-demo`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  const themeResults = await page.evaluate(() => {
    const results = {};
    
    // Look for code blocks
    const codeBlocks = document.querySelectorAll('figure[role="img"][aria-label*="Code block"], pre');
    results.codeBlockCount = codeBlocks.length;
    
    // Look for theme selector button (palette icon)
    const buttons = Array.from(document.querySelectorAll('button'));
    const paletteButton = buttons.find(btn => {
      const ariaLabel = btn.getAttribute('aria-label');
      return ariaLabel && ariaLabel.toLowerCase().includes('theme');
    });
    
    results.hasThemeSelector = paletteButton !== null;
    
    if (paletteButton) {
      // Check current syntax colors
      const codeBlock = document.querySelector('pre');
      if (codeBlock) {
        const keyword = codeBlock.querySelector('.keyword');
        if (keyword) {
          results.initialKeywordColor = window.getComputedStyle(keyword).color;
        }
      }
      
      // Click theme selector
      paletteButton.click();
      results.clickedSelector = true;
    }
    
    return results;
  });
  
  console.log(`Code blocks found: ${themeResults.codeBlockCount}`);
  console.log(`Theme selector found: ${themeResults.hasThemeSelector ? 'YES' : 'NO'}`);
  if (themeResults.initialKeywordColor) {
    console.log(`Initial keyword color: ${themeResults.initialKeywordColor}`);
  }
  
  if (themeResults.clickedSelector) {
    await sleep(500);
    
    const menuResults = await page.evaluate(() => {
      const results = {};
      
      // Check theme menu
      const menu = document.querySelector('[role="menu"]');
      results.hasMenu = menu !== null;
      
      if (menu) {
        const menuItems = menu.querySelectorAll('[role="menuitem"]');
        results.themeCount = menuItems.length;
        results.themes = Array.from(menuItems).map(item => item.textContent);
        
        // Try clicking Dracula theme
        const dracula = Array.from(menuItems).find(item => item.textContent.includes('Dracula'));
        if (dracula) {
          dracula.click();
          results.selectedTheme = 'Dracula';
        }
      }
      
      return results;
    });
    
    console.log(`Theme menu opened: ${menuResults.hasMenu ? 'YES' : 'NO'}`);
    if (menuResults.hasMenu) {
      console.log(`Themes available: ${menuResults.themeCount}`);
      console.log(`Theme list: ${menuResults.themes.join(', ')}`);
      if (menuResults.selectedTheme) {
        console.log(`Selected theme: ${menuResults.selectedTheme}`);
      }
    }
    
    // Check if theme changed
    await sleep(500);
    const themeChangeResults = await page.evaluate(() => {
      const results = {};
      
      // Check localStorage
      const keys = Object.keys(localStorage);
      const themeKey = keys.find(key => key.toLowerCase().includes('theme'));
      if (themeKey) {
        results.savedTheme = localStorage.getItem(themeKey);
      }
      
      // Check if colors changed
      const codeBlock = document.querySelector('pre');
      if (codeBlock) {
        const keyword = codeBlock.querySelector('.keyword');
        if (keyword) {
          results.newKeywordColor = window.getComputedStyle(keyword).color;
        }
      }
      
      return results;
    });
    
    if (themeChangeResults.savedTheme) {
      console.log(`Theme saved in localStorage: ${themeChangeResults.savedTheme}`);
    }
    if (themeChangeResults.newKeywordColor && themeChangeResults.newKeywordColor !== themeResults.initialKeywordColor) {
      console.log(`Theme applied - keyword color changed to: ${themeChangeResults.newKeywordColor}`);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  const summary = {
    feedbackWidget: feedbackResults.widgetCount > 0 && postClickResults.feedbackData && postClickResults.isDisabled,
    relatedArticles: relatedResults.hasRelatedSection && relatedResults.cardCount > 0,
    syntaxTheme: themeResults.hasThemeSelector && themeResults.codeBlockCount > 0
  };
  
  console.log(`\nFeedback Widget: ${summary.feedbackWidget ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Related Articles: ${summary.relatedArticles ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`Syntax Theme Switcher: ${summary.syntaxTheme ? 'PASS ✓' : 'FAIL ✗'}`);
  
  await browser.close();
}

// Run tests
testFeaturesDirectly().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});