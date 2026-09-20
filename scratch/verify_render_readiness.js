// scratch/verify_render_readiness.js
const fs = require('fs');
const path = require('path');

console.log('--- Verifying Render & Backend Deployment Readiness ---');

// 1. Check requirements.txt at root and in backend-python
const rootReq = fs.readFileSync(path.join(__dirname, '..', 'requirements.txt'), 'utf8');
const backendReq = fs.readFileSync(path.join(__dirname, '..', 'backend-python', 'requirements.txt'), 'utf8');

['email-validator', 'fastapi', 'uvicorn', 'pydantic', 'sqlalchemy', 'bcrypt'].forEach(dep => {
  if (rootReq.includes(dep) && backendReq.includes(dep)) {
    console.log(`✅ Dependency '${dep}' verified in both requirements.txt files.`);
  } else {
    console.error(`❌ Dependency '${dep}' missing!`);
    process.exit(1);
  }
});

// 2. Check main.py at root
const rootMain = fs.readFileSync(path.join(__dirname, '..', 'main.py'), 'utf8');
if (rootMain.includes('backend-python') && rootMain.includes('os.environ.get("PORT"')) {
  console.log('✅ Root main.py entrypoint verified with PORT env handling.');
} else {
  console.error('❌ Root main.py invalid!');
  process.exit(1);
}

// 3. Check backend-python/main.py
const backendMain = fs.readFileSync(path.join(__dirname, '..', 'backend-python', 'main.py'), 'utf8');
if (backendMain.includes('os.environ.get("PORT"') && backendMain.includes('sys.path.insert')) {
  console.log('✅ backend-python/main.py verified with PORT env and sys.path setup.');
} else {
  console.error('❌ backend-python/main.py missing PORT or sys.path handling!');
  process.exit(1);
}

// 4. Check package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
if (pkg.scripts && pkg.scripts.start === 'node server/server.js') {
  console.log('✅ package.json start command verified: node server/server.js');
} else {
  console.error('❌ package.json start command missing or invalid!');
  process.exit(1);
}

// 5. Check server/server.js PORT handling
const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server', 'server.js'), 'utf8');
if (serverJs.includes('process.env.PORT || 5000')) {
  console.log('✅ server/server.js PORT handling verified: process.env.PORT || 5000');
} else {
  console.error('❌ server/server.js missing process.env.PORT!');
  process.exit(1);
}

// 6. Check render.yaml
const renderYaml = fs.readFileSync(path.join(__dirname, '..', 'render.yaml'), 'utf8');
if (renderYaml.includes('requirements.txt') && renderYaml.includes('$PORT')) {
  console.log('✅ render.yaml verified with requirements.txt and $PORT binding.');
} else {
  console.error('❌ render.yaml missing requirements.txt or $PORT!');
  process.exit(1);
}

console.log('🎉 ALL RENDER DEPLOYMENT READINESS CHECKS PASSED 100%!');
