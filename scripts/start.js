const childProcess = require('child_process')
const fs = require('fs')

function run(command, args, label = command) {
  const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command
  const result = childProcess.spawnSync(executable, args, {
    stdio: 'inherit',
    shell: false
  })

  if (result.error) {
    console.error(`[START] Failed to run ${label}: ${result.error.message}`)
    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function runNpm(args) {
  if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, ...args], `npm ${args.join(' ')}`)
    return
  }

  run('npm', args, `npm ${args.join(' ')}`)
}

function ensureDependencies() {
  if (fs.existsSync('node_modules')) return

  console.log('[START] Installing dependencies...')
  runNpm(fs.existsSync('package-lock.json') ? ['ci'] : ['install'])
}

function ensureChromium() {
  if (fs.existsSync('.playwright-chromium-installed')) return

  console.log('[START] Installing Chromium...')
  runNpm(['exec', 'playwright', 'install', 'chromium', '--with-deps'])
  fs.writeFileSync('.playwright-chromium-installed', new Date().toISOString())
}

function ensureBuild() {
  if (fs.existsSync('dist/index.js')) return

  console.log('[START] Building TypeScript project...')
  runNpm(['run', 'build'])
}

function main() {
  run(process.execPath, ['./scripts/check-node-version.js'], 'node version check')
  ensureDependencies()
  ensureChromium()
  ensureBuild()

  const passthroughArgs = process.argv.slice(2)
  const botArgs = passthroughArgs.includes('--dashboard')
    ? passthroughArgs.map(arg => (arg === '--dashboard' ? '-dashboard' : arg))
    : passthroughArgs

  run(process.execPath, ['--enable-source-maps', './dist/index.js', ...botArgs], 'bot')
}

main()
