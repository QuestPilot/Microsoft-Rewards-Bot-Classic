const requiredMajor = 22
const currentMajor = Number.parseInt(process.versions.node.split('.')[0] || '0', 10)

if (!Number.isFinite(currentMajor) || currentMajor < requiredMajor) {
  console.error(`[NODE] Microsoft Rewards Bot Classic requires Node.js ${requiredMajor}+.`)
  console.error(`[NODE] Current version: ${process.version}`)
  console.error('[NODE] Install a current Node.js LTS release before running the bot.')
  process.exit(1)
}
