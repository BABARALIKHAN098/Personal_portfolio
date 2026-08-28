import {cp, mkdir, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),dist=path.join(root,'dist');
const files=[
  'index.html','robots.txt','sitemap.xml','styles.css','project-images.css','buttons.css',
  'social-icons.css','process.css','design-refinement.css','about.css','journey.css',
  'ai-background.css','chatbot.css','data.js','mental-health-project.js','app.js',
  'ai-background.js','chatbot.js'
];
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
for(const file of files)await cp(path.join(root,file),path.join(dist,file));
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
for(const file of await readdir(root))if(file.toLowerCase().endsWith('.pdf'))await cp(path.join(root,file),path.join(dist,file));
const isProduction=process.env.CONTEXT==='production'||process.env.VERCEL_ENV==='production';
const api=(process.env.PUBLIC_CHAT_API_URL||'').trim().replace(/\/$/,'');
if(api&&!/^https:\/\//.test(api))throw new Error('PUBLIC_CHAT_API_URL must use HTTPS');
await writeFile(path.join(dist,'chatbot-runtime-config.js'),`window.PORTFOLIO_CHAT_API_URL = ${JSON.stringify(api)};\n`,'utf8');
const vercelProductionUrl=process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'';
const siteUrl=(process.env.SITE_URL||vercelProductionUrl).trim().replace(/\/$/,'');
if(siteUrl&&!/^https:\/\//.test(siteUrl))throw new Error('SITE_URL must use HTTPS');
if(isProduction&&!siteUrl)throw new Error('SITE_URL is required for a production build');
if(siteUrl){const sitemapPath=path.join(dist,'sitemap.xml');const sitemap=await readFile(sitemapPath,'utf8');await writeFile(sitemapPath,sitemap.replace('https://example.com',siteUrl),'utf8')}
const html=await readFile(path.join(dist,'index.html'),'utf8');
if(!html.includes('chatbot-runtime-config.js'))throw new Error('Runtime chatbot configuration is not included in index.html');
console.log(`Built safe static site in dist (${files.length} root assets + assets/ + public PDFs).`);
