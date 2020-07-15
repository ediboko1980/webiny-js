const fs = require("fs");
const path = require("path");
const util = require("util");
const ncp = util.promisify(require("ncp").ncp);
const findUp = require("find-up");
const camelCase = require("lodash.camelcase");
const kebabCase = require("lodash.kebabcase");
const readJson = require("load-json-file");
const writeJson = require("write-json-file");
const pluralize = require("pluralize");
const Case = require("case");
const { replaceInPath } = require("replace-in-path");
const execa = require("execa");

module.exports = [
    {
        name: "cli-plugin-scaffold-template-react-package",
        type: "cli-plugin-scaffold-template",
        scaffold: {
            name: "React Package",
            questions: () => {
                return [
                    {
                        name: "location",
                        message: "Enter package location (including package name)",
                        validate: location => {
                            if (location === "") {
                                return "Please enter a package location";
                            }

                            if (fs.existsSync(path.resolve(location))) {
                                return "The target location already exists";
                            }

                            return true;
                        }
                    }
                ];
            },
            generate: async ({ input }) => {
                const { location } = input;
                const fullLocation = path.resolve(location);

                const packageName = kebabCase(location);

                // Then we also copy the template folder
                const sourceFolder = path.join(__dirname, "template");

                if (fs.existsSync(location)) {
                    throw new Error(`Destination folder ${location} already exists!`);
                }

                await fs.mkdirSync(location, { recursive: true });

                // Get base TS config & tsconfig.build path
                const baseTsConfigPath = path
                    .relative(
                        fullLocation,
                        findUp.sync("tsconfig.json", {
                            cwd: fullLocation
                        })
                    )
                    .replace(/\\/g, "/");
                const baseTsConfigBuildPath = path
                    .relative(
                        fullLocation,
                        findUp.sync("tsconfig.build.json", {
                            cwd: fullLocation
                        })
                    )
                    .replace(/\\/g, "/");

                console.log(baseTsConfigPath);
                console.log(baseTsConfigBuildPath);
                console.log(baseTsConfigBuildPath);

                // Copy template files
                await ncp(sourceFolder, location);

                // Update the package's name
                const packageJsonPath = path.resolve(location, "package.json");
                let packageJson = fs.readFileSync(packageJsonPath, "utf8");
                packageJson = packageJson.replace("[PACKAGE_NAME]", packageName);
                fs.writeFileSync(packageJsonPath, packageJson);

                // Get .babel.react.js path
                const babelReactJsPath = path
                    .relative(
                        fullLocation,
                        findUp.sync(".babel.react.js", {
                            cwd: fullLocation
                        })
                    )
                    .replace(/\\/g, "/");

                // Update .babelrc.js
                // TODO [Andrei] [tested, seems ok] automatically find ".babel.react" & update this require (test this pls)
                const babelrcPath = path.resolve(location, ".babelrc.js");
                let babelrc = fs.readFileSync(babelrcPath, "utf8");
                babelrc = babelrc.replace("[.BABEL.REACT_PATH]", babelReactJsPath);
                fs.writeFileSync(babelrcPath, babelrc);

                // Update tsconfig "extends" path
                // TODO [Andrei] [tested, seems ok] is this ok? (test this pls)
                const tsConfigPath = path.join(fullLocation, "tsconfig.json");
                const tsconfig = require(tsConfigPath);
                tsconfig.extends = baseTsConfigPath;
                fs.writeFileSync(tsConfigPath, JSON.stringify(tsconfig, null, 2));

                // Update tsconfig.build "extends" path
                // TODO [Andrei] [tested, seems ok] automatically find "tsconfig.build.json" and update it (test this pls)
                const tsconfigBuildPath = path.join(fullLocation, "tsconfig.build.json");
                const tsconfigBuild = require(tsconfigBuildPath);
                tsconfigBuild.extends = baseTsConfigBuildPath;
                fs.writeFileSync(tsconfigBuildPath, JSON.stringify(tsconfigBuild, null, 2));
            }
        }
    }
];
