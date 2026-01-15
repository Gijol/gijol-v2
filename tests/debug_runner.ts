import { uploadAndEvaluate } from '../features/graduation/usecases/uploadAndEvaluate';
import input from './fixtures/input-20205098.json';

async function run() {
  console.log('Starting debug run...');
  try {
    const result = await uploadAndEvaluate(input as any);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
