const { generateText } = require('ai');
const { createAzure } = require('@ai-sdk/azure');
require('dotenv').config();

// Create Azure provider
const azure = createAzure({
  apiKey: process.env.AZURE_API_KEY,
  baseURL: process.env.AZURE_API_ENDPOINT
});

async function testAzureAI() {
  console.log('Testing Azure AI SDK configuration...');
  console.log('Resource Name:', process.env.AZURE_RESOURCE_NAME);
  console.log('Deployment Name:', process.env.AZURE_DEPLOYMENT_NAME);
  console.log('API Version:', process.env.AZURE_API_VERSION);
  console.log('Base URL:', process.env.AZURE_API_ENDPOINT);
  
  try {
    const result = await generateText({
      model: azure(process.env.AZURE_DEPLOYMENT_NAME),
      prompt: 'Say hello and confirm you are working correctly. Keep it brief.',
      maxTokens: 50
    });
    
    console.log('\n✅ Success! Azure AI SDK is working correctly.');
    console.log('Response:', result.text);
    console.log('\nUsage:', result.usage);
    
  } catch (error) {
    console.error('\n❌ Error testing Azure AI SDK:');
    console.error('Error message:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Response body:', error.responseBody);
    
    if (error.statusCode === 404) {
      console.log('\n💡 This likely means:');
      console.log('- The deployment name is incorrect');
      console.log('- The deployment doesn\'t exist in your Azure resource');
      console.log('- Check your Azure portal for the correct deployment name');
    }
  }
}

testAzureAI();
