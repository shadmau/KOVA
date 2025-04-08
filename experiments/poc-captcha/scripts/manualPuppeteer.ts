import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { exec, spawn } from 'child_process';
import path from 'path';
dotenv.config();



const easyOCRPythonPath = path.resolve('../tools/easyOCR/easyocr-env/bin/python3');
const easyOCRScript = path.resolve('../tools/easyOCR/detect_text.py');

const yolov8PythonPath = path.resolve('../tools/yolov8/yolov8-env/bin/python3');
const yolov8Script = path.resolve('../tools/yolov8/detect_captcha.py');

function runPythonOCR(imagePath: string) {
  return new Promise((resolve, reject) => {
    exec(`${easyOCRPythonPath} ${easyOCRScript} "${imagePath}"`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      resolve(stdout.trim());
    });
  });
}


function runPythonScript(pythonPath: string, scriptPath: string, imagePath: string) {
  return new Promise((resolve, reject) => {
    const process = spawn(pythonPath, [scriptPath, imagePath]);

    let outputData = '';

    process.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    process.stderr.on('data', (data) => {
      console.error(`PYTHON ERROR: ${data.toString()}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(outputData.trim());
      } else {
        reject(`Python script exited with code ${code}`);
      }
    });

    // Handle process errors
    process.on('error', (error) => {
      reject(`Error starting Python script: ${error.message}`);
    });
  });
}





async function testReCaptcha() {
  console.log('Starting reCAPTCHA test...');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });

    await page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
    console.log('Navigated to page with reCAPTCHA');

    const hasCaptcha = await page.evaluate(() => {
      return !!document.querySelector('#recaptchaWidget iframe');
    });

    if (hasCaptcha) {
      console.log('reCAPTCHA widget detected on page');
    } else {
      console.log('No reCAPTCHA widget detected, waiting for it to load...');
      await page.waitForSelector('#recaptchaWidget iframe', { timeout: 10000 })
        .then(() => console.log('reCAPTCHA widget loaded'))
        .catch(() => console.log('reCAPTCHA widget not found after waiting'));
    }

    console.log('Attempting to click the reCAPTCHA checkbox...');

    const recaptchaFrame = await page.frames().find(frame =>
      frame.url().includes('google.com/recaptcha/api2/anchor')
    );

    if (recaptchaFrame) {
      await recaptchaFrame.click('.recaptcha-checkbox-border');
      console.log('Clicked on reCAPTCHA checkbox');

      console.log('Waiting for challenge to appear...');
      new Promise(resolve => setTimeout(resolve, 3000));

      const challengeFrame = await page.frames().find(frame =>
        frame.url().includes('google.com/recaptcha/api2/bframe')
      );
      let is3x3 = true
      if (challengeFrame) {
        console.log('Challenge iframe found, waiting for it to be ready...');

        try {
          await challengeFrame.waitForSelector('.rc-imageselect-challenge', { visible: true });
          console.log('Challenge area is ready');
          const frameSize = await challengeFrame.evaluate(() => {
            const recaptchaBox = document.querySelector('.rc-imageselect-challenge');
            if (!recaptchaBox) return null;

            const rect = recaptchaBox.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom
            };
          });
          if (!frameSize) { throw new Error('Frame size not found'); }
          switch (frameSize.bottom) {
            case 514:
              is3x3 = false
              break
            case 515:
              is3x3 = true
              break
            default:
              throw new Error(`Unknown frame size: ${frameSize.bottom}`);
          }

        } catch (e: any) {
          console.log('Challenge area not found or not clickable:', e.message);
        }

      } else {
        console.log('Challenge iframe not found after waiting');
      }





      await page.screenshot({ path: 'captcha_to_solve.png', fullPage: true });
      console.log('Screenshot saved as captcha_to_solve.png');
      console.log("Retrieving challenge text")
      const text = await runPythonOCR("captcha_to_solve.png").then((text: any) => text.replace(/\n/g, ' ').trim())
      console.log("OCR Text:", text)


      const yolov8Result = await runPythonScript(yolov8PythonPath, yolov8Script, "captcha_to_solve.png") as any
      console.log("YOLOv8 Result:", yolov8Result)
      const jsonMatch = yolov8Result.match(/\[.*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON detected in YOLOv8 output");
      }
      const detectedObjects = JSON.parse(jsonMatch[0]);

      if (detectedObjects.length === 0) {
        console.log("No objects detected, skipping clicks.");
      } else {
        const matchingObjects = detectedObjects.filter((obj: { object: string }) =>
          text.toLowerCase().includes(obj.object.toLowerCase())
        );

        if (matchingObjects.length > 0) {
          const boxes3x3 = [
            { id: 1, x1: 465, x2: 589, y1: 140, y2: 260 },
            { id: 2, x1: 590, x2: 714, y1: 140, y2: 260 },
            { id: 3, x1: 723, x2: 847, y1: 140, y2: 260 },
            { id: 4, x1: 465, x2: 589, y1: 270, y2: 392 },
            { id: 5, x1: 590, x2: 714, y1: 270, y2: 392 },
            { id: 6, x1: 723, x2: 847, y1: 270, y2: 392 },
            { id: 7, x1: 465, x2: 589, y1: 401, y2: 509 },
            { id: 8, x1: 590, x2: 714, y1: 401, y2: 509 },
            { id: 9, x1: 723, x2: 847, y1: 401, y2: 520 },
          ];

          const boxes4x4 = [
            { id: 1, x1: 465, x2: 555, y1: 140, y2: 230 },
            { id: 2, x1: 560, x2: 653, y1: 140, y2: 230 },
            { id: 3, x1: 658, x2: 750, y1: 140, y2: 230 },
            { id: 4, x1: 755, x2: 848, y1: 140, y2: 230 },
            { id: 5, x1: 465, x2: 555, y1: 235, y2: 330 },
            { id: 6, x1: 560, x2: 653, y1: 235, y2: 330 },
            { id: 7, x1: 658, x2: 750, y1: 235, y2: 330 },
            { id: 8, x1: 755, x2: 848, y1: 235, y2: 330 },
            { id: 9, x1: 465, x2: 555, y1: 330, y2: 425 },
            { id: 10, x1: 560, x2: 653, y1: 330, y2: 425 },
            { id: 11, x1: 658, x2: 750, y1: 330, y2: 425 },
            { id: 12, x1: 755, x2: 848, y1: 330, y2: 425 },
            { id: 13, x1: 465, x2: 555, y1: 430, y2: 525 },
            { id: 14, x1: 560, x2: 653, y1: 430, y2: 525 },
            { id: 15, x1: 658, x2: 750, y1: 430, y2: 525 },
            { id: 16, x1: 755, x2: 848, y1: 430, y2: 525 },
          ]
          // Keep track of clicked boxes
          const clickedBoxes = new Set<number>();

          // Function to calculate overlap percentage between two boxes
          function calculateOverlap(box1: { x1: number, y1: number, x2: number, y2: number },
            box2: { x1: number, y1: number, x2: number, y2: number }): number {
            const xOverlap = Math.max(0, Math.min(box1.x2, box2.x2) - Math.max(box1.x1, box2.x1));
            const yOverlap = Math.max(0, Math.min(box1.y2, box2.y2) - Math.max(box1.y1, box2.y1));
            const overlapArea = xOverlap * yOverlap;

            const box1Area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
            return overlapArea / box1Area;
          }

          console.log(`Found ${matchingObjects.length} matching objects`);

          for (const matchingObject of matchingObjects) {
            const { x1, y1, x2, y2 } = matchingObject.boundingBox;
            console.log(`Processing object: ${matchingObject.object} with bounding box: (${x1}, ${y1}) to (${x2}, ${y2})`);
            if (is3x3) {
              // Find the box with the highest overlap
              let bestMatch = null;
              let highestOverlap = 0;

              for (const box of boxes3x3) {
                const overlap = calculateOverlap(matchingObject.boundingBox, box);
                if (overlap > highestOverlap) {
                  highestOverlap = overlap;
                  bestMatch = box;
                }
              }

              if (bestMatch && highestOverlap >= 0.9) { // 90% overlap threshold
                if (clickedBoxes.has(bestMatch.id)) {
                  console.log(`Box ${bestMatch.id} was already clicked, skipping...`);
                  continue;
                }

                // Calculate center point of the box
                const centerX = (bestMatch.x1 + bestMatch.x2) / 2;
                const centerY = (bestMatch.y1 + bestMatch.y2) / 2;

                console.log(`Clicking box ${bestMatch.id} at (${centerX}, ${centerY}) with ${(highestOverlap * 100).toFixed(1)}% overlap`);
                await page.mouse.click(centerX, centerY, { delay: 2000 });
                clickedBoxes.add(bestMatch.id);
              } else {
                console.log(`No suitable box found for object ${matchingObject.object} (best overlap: ${(highestOverlap * 100).toFixed(1)}%)`);
              }
            } else {
              console.log("Processing 4x4 grid");

              // Check if object is wide enough (at least 30 pixels)
              const objectWidth = x2 - x1;
              if (objectWidth < 30) {
                console.log(`Object ${matchingObject.object} is too small (width: ${objectWidth.toFixed(1)}px), skipping...`);
                continue;
              }

              // Find all boxes with sufficient overlap
              let overlappingBoxes = [];

              for (const box of boxes4x4) {
                const overlap = calculateOverlap(matchingObject.boundingBox, box);
                if (overlap >= 0.1) { // 10% overlap threshold
                  overlappingBoxes.push({
                    box,
                    overlap
                  });
                }
              }

              // Sort by overlap percentage (highest first)
              overlappingBoxes.sort((a, b) => b.overlap - a.overlap);

              if (overlappingBoxes.length > 0) {
                console.log(`Found ${overlappingBoxes.length} overlapping boxes for object ${matchingObject.object}`);

                for (const { box, overlap } of overlappingBoxes) {
                  if (clickedBoxes.has(box.id)) {
                    console.log(`Box ${box.id} was already clicked, skipping...`);
                    continue;
                  }

                  // Calculate center point of the box
                  const centerX = (box.x1 + box.x2) / 2;
                  const centerY = (box.y1 + box.y2) / 2;

                  console.log(`Clicking box ${box.id} at (${centerX}, ${centerY}) with ${(overlap * 100).toFixed(1)}% overlap`);
                  await page.mouse.click(centerX, centerY, { delay: 2000 });
                  clickedBoxes.add(box.id);
                }
              } else {
                console.log(`No boxes with sufficient overlap found for object ${matchingObject.object}`);
              }
            }
          }
        } else {
          console.log("No matching objects found in OCR text");
        }
      }
      console.log("Filtered YOLOv8 Output:");
      console.log(detectedObjects);
      console.log('Attempting to click verify button...');
      try {
        // Wait a bit for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (challengeFrame) {
          await challengeFrame.click('.rc-button-default');
          console.log('Clicked verify button');
        } else {
          console.log('Could not find challenge frame for verify button');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (e: any) {
        console.log('Error clicking verify button:', e.message);
      }


      console.log('reCAPTCHA verification completed or timeout occurred');
    } else {
      console.log('Could not find reCAPTCHA iframe');
    }


    await page.click('button[type="submit"]');
    console.log('Clicked submit button');

    await page.waitForSelector('#result');

    const resultText = await page.evaluate(() => {
      return (document.getElementById('result') as HTMLElement).innerText;
    });

    console.log(`Result: ${resultText}`);
    await new Promise(resolve => setTimeout(resolve, 10000));


  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('Pausing for 3 seconds before closing browser...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await browser.close();
    console.log('Test completed');
  }
}

testReCaptcha(); 