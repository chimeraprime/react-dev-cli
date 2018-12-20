# :fire: react-dev-cli :fire:

A command line tool that helps automate repeatable actions during react application development, like creating a new component or reducer structure. :construction_worker:

## Install :hammer:
>```npm install -g react-dev-cli```

or
>```yarn global add react-dev-cli```

### Config :wrench:
To define config create a `.rdc` file in the root directory of your application.

| Property | Sample value     | Description                            |
|----------|------------------|----------------------------------------|
| root     | src              | Path to the source of your application |
| framework| nextjs           | Path to the source of your application |

## Usage :speedboat:
:exclamation::exclamation::exclamation:
You should run a CLI tool being always in the root directory of your application.

Use ```rdc --help``` to print help menu.

### Generate component
>```rdc component HelloWorld```

This will generate a folder with the basic structure of your component in a relative path to the value of `root` in your `.rdc` file.

If you already have `components` folder in the source directory of your project, the new generated component will be created there. In another case, a component folder will be created in the root directory of your application.

| Command      | Description                           |
|-------------|---------------------------------------|
| `rdc component HelloWorld -s`       | Generates with styles (.scss) file and import in a component file |
| `rdc component HelloWorld -f`  | Generates stateless component         |
| `rdc component HelloWorld -c` | Exports connected with redux store component  |
| `rdc component HelloWorld --subfolder pages` | Generates component in a /pages directory  |

Differences in the structure of the components you create [can be seen here](templates/component.js).

## Contributing
If you need any changes in a react-dev-cli or you just want to have a contribution to this project, we'll be glad if you will help us. For more details and how to get started, see [CONTRIBUTING.md](CONTRIBUTING.md)
