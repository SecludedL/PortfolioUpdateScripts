# Working on the project

## Local development
* Open in Visual Studio Code > `Open in container` using the config in the `.devcontainer` folder
* Login to Google Scripts `clasp login`
* Clone locally: `clasp clone [ScriptID]` (eg: `clasp clone 1Vb_dYO_G9J5ns9CNER3EieoNL_nYV37daC2Ot82PBgYho84pmO5LTN36`)
* Install the packages required for local development `npm install`
* Run one of the commands used to execute the main scripts:
    * `npm run dev-indexes` - grab the latest data for some sample indexes
    * `npm run dev-fx` - grab the latest data for some sample FX pairs
    * `npm run dev-stocks` - grab the latest data for some sample stocks

## Publishing changes
* Once you made the changes to the code, deploy to prod using: `npm run deploy`
