import { version as packageVersion } from '../../package.json'
import { ExitCode } from './exit-code'
import { parseArgs } from './parse-args'

export async function main(): Promise<void> {
  try {
    // Setup global error handlers
    process.on('uncaughtException', errorHandler)
    process.on('unhandledRejection', errorHandler)

    const { help, version, quiet, options } = await parseArgs()
    console.log('1111', help, version, quiet, options)

    if (help) {
      process.exit(ExitCode.Success)
    }
    else if (version) {
      // Show the version number and exit
      console.log(packageVersion)
      process.exit(ExitCode.Success)
    }
  }
  catch (error) {

  }
}

function errorHandler(error: Error): void {
  let message = error.message || String(error)

  if (process.env.DEBUG || process.env.NODE_ENV === 'development')
    message = error.stack || message

  console.error(message)
  process.exit(ExitCode.FatalError)
}
