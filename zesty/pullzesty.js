/**
    running this project: 
    node pullfromzesty.js <config_file> [--verbose]
    if no config file is specified, this will look for one in the current directory called zesty.yaml
    config files supported: .json, .yaml, .toml
 */
//  Imports
const request = require('request') // to make the GET Request
const fs = require('fs') // to edit the file
const mkdirp = require('mkdirp')
const matter = require('gray-matter')
const chalk = require('chalk')
const args = process.argv.slice(2) // get rid of the unneccesary arguments

let configFile = "zesty.yaml"
let verbose = (process.argv.indexOf('--verbose') != -1) ? true : false

if (verbose) { console.log(chalk.black.bgYellow('Verbose Mode On')) }

if (!args[0] || args[0] == "--verbose") {
    if (verbose) { console.log(`No specified config, trying default ${chalk.white.bgGreen("zesty.yaml")}`) }
}
else {
    if (verbose) { console.log(`Using specified config file ${chalk.white.bgGreen(args[0])}`) }
    configFile = args[0]
}

getConfigData(configFile, (configData) => {
    let instanceURL = configData.instanceURL

    if ("contentZuids" in configData) {
        if (verbose) { console.log(`${chalk.white.bgBlue(`Content Zuids Field Found`)}`) }
        if ("items" in configData.contentZuids) {
            if (verbose) { console.log(`${chalk.white.bgBlue(`Items @ Content Zuids Field Found`)}`) }
            let items = configData.contentZuids.items

            for (let zuid in items) {
                request(`${instanceURL}/-/basic-content/${zuid}.json`, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        createMDForJSON(JSON.parse(body)['data'], items[zuid])
                    }
                })
            }
        }
        if ("arrays" in configData.contentZuids) {
            if (verbose) { console.log(`${chalk.white.bgBlue(`Arrays @ Content Zuids Field Found`)}`) }
            let arrays = configData.contentZuids.arrays
            for (let zuid in arrays) {
                request(`${instanceURL}/-/basic-content/${zuid}.json`, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    let json = JSON.parse(body)
                    let final = filterArray(json)

                    // now, final is a dictionary that stores the zuid of each item.
                    for (let key in final) {
                        // lets now take each item of json and create the markdown file
                        
                        createMDForJSON(final[key], `${arrays[zuid]}/${final[key]['_meta_title']}.md`)
                    }

                }
                })

            }
        }
    }

    if ("endpoints" in configData) {
        if (verbose) { console.log(`${chalk.white.bgBlue(`Endpoints Field Found`)}`) }
        if ("custom" in configData.endpoints) {
            if (verbose) { console.log(`${chalk.white.bgBlue(`Custom @ Endpoints Field Found`)}`) }
            let customEndpoints = configData.endpoints.custom
            for (let endpoint in customEndpoints) {
                 if (verbose) { console.log(`Requesting ${chalk.white.bgYellow(`${instanceURL}/${endpoint}.json`)}`) }
                request(`${instanceURL}/${endpoint}.json`, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        let directory = customEndpoints[endpoint].substring(0, customEndpoints[endpoint].lastIndexOf('/'))
                        if (directory === '') { directory = '.' }
                        mkdirp(directory, (err) => {
                            fs.writeFile(customEndpoints[endpoint], body, (err) => {
                                if (err) {
                                    return console.log(err)
                                }
                                if (verbose) {console.log(`File Created at ${chalk.white.bgGreen(customEndpoints[endpoint])}`)}
                            })
                        })
                    }
                    else {
                        console.log(`${chalk.white.bgRed(`${instanceURL}/${endpoint}.json`)} could not be found`)
                    }
                })
            }
        }
        if ("items" in configData.endpoints) {
            if (verbose) { console.log(`${chalk.white.bgBlue(`Items @ Endpoints Field Found`)}`) }
            let itemEndpoints = configData.endpoints.items
            for (let zuid in itemEndpoints) {
                request(`${instanceURL}/-/basic-content/${zuid}.json`, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        let directory = itemEndpoints[zuid].substring(0, itemEndpoints[zuid].lastIndexOf('/'))
                        if (directory === '') { directory = '.' }
                        mkdirp(directory, (err) => {
                            fs.writeFile(itemEndpoints[zuid], body, (err) => {
                                if (err) {
                                    return console.log(err)
                                }
                                if (verbose) {console.log(`JSON File Created at ${chalk.white.bgGreen(itemEndpoints[zuid])}`)}
                            })
                        })
                    }
                })
            }
        }
        if ("arrays" in configData.endpoints) {
            if (verbose) { console.log(`${chalk.white.bgBlue(`Arrays @ Endpoints Field Found`)}`) }
            let arrayEndpoints = configData.endpoints.arrays
            for (let zuid in arrayEndpoints) {
                request(`${instanceURL}/-/basic-content/${zuid}.json`, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                        
                        let json = filterArray(JSON.parse(body))
                        for (let key in json) {
                            createJSONFile(json[key], `${arrayEndpoints[zuid]}/${json[key]['_meta_title']}.json`)
                        }
                    }
                })
            }
        }
    }
})

function createJSONFile(json, filePath) {
    let data = JSON.stringify(json)
    let directory = filePath.substring(0, filePath.lastIndexOf('/'))
        if (directory === '') { directory = '.' }
        mkdirp(directory, (err) => {
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    return console.log(err)
                }
                if (verbose) {console.log(`JSON File Created at ${chalk.white.bgGreen(`${filePath}.json`)}`)}
            })
        })
}
/// inputObj in the form {data: {//}}
function filterArray(inputObj) {
    // first, we refine the array so we only have the latest version of each item
    let json = inputObj
    let final = {}
    for (let key in json['data']) {
        
        let dict = json['data'][key]
        let z = dict['_item_zuid']
        let version = dict['_version']
        

        if (z in final) {
            if (final[z]['_version'] < version) {
                final[z] = dict
            }
            
        } 
        else {
            final[z] = dict
        }
    }
    return final
}

function getConfigData(configFile, cb) {
    let extension = configFile.substr(configFile.lastIndexOf('.') + 1, configFile.length)
    if (extension === 'toml') {
        const toml = require('toml')

        fs.readFile(configFile, 'utf8', (err, contents) => {
            if (err) {
                console.log(`${chalk.white.bgRed('Failed')}: fs error in reading your file
                Error Output: `)
                console.log(err)
                process.exit(1)
            }
            let data = contents
            data = `---${extension}\n${contents}`

            cb(matter(data, {
                engines: {
                    toml: toml.parse.bind(toml)
                }
            }).data)
        })
        } 
    else {
        if (extension === 'json' || extension === 'yaml') {}
        else { console.log(`Your File Extension ${extension} has not been tested, trying to read anyways`) }
        fs.readFile(configFile, 'utf8', (err, contents) => {
            if (err) {
                console.log(`${chalk.white.bgRed('Failed')}: fs error in reading your file
                Error Output: `)
                console.log(err)
                process.exit(1)
            }
            let data = contents
            data = `---${extension}\n${contents}`
            cb(matter(data).data)
        })
    }
}


function createMDForJSON (json, fileName) {
  let output = `---\n`

  for (let k in json) {
    let key = k
    if (key[0] === '`') {
      key = key.substr(1)
    }
    key = key.replace(/(?:\r\n|\r|\n)/g, '<br>')
    output += `${key}: ${json[key]}\n`
  }
  output += '---'
  let directory = fileName.substring(0, fileName.lastIndexOf('/'))
  if (directory === '') { directory = '.' }
  mkdirp(directory, (err) => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    fs.writeFile(fileName, output, (err) => {
      if (err) {
        return console.log(err)
      }
      if (verbose) {console.log(`Markdown File Created at ${chalk.white.bgGreen(fileName)}`)}
    })
  })
}

