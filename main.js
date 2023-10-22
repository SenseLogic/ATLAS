// -- IMPORTS

const { Plugin, PluginSettingTab, Setting, TFile, TFolder } = require( 'obsidian' );

// -- TYPES

class AtlasSettingTab
    extends PluginSettingTab
{
    // -- CONSTRUCTORS

    constructor(
        app,
        plugin
        )
    {
        super( app, plugin );

        this.plugin = plugin;
    }

    // ~~

    display(
        )
    {
        const { containerEl } = this;

        containerEl.empty();

        new Setting( containerEl )
            .setName( 'Breadcrumb font size' )
            .addText(
                text =>
                text
                    .setPlaceholder( '0.7em' )
                    .setValue( this.plugin.settings.breadcrumbFontSize )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.breadcrumbFontSize = value;
                            await this.plugin.saveSettings();
                        }
                ) );
    }
}

// ~~

module.exports = class Atlas extends Plugin
{
    // -- OPERATIONS

    async loadSettings(
        )
    {
        this.settings
            = Object.assign(
                  {},
                  {
                      breadcrumbFontSize: '0.7em'
                  },
                  await this.loadData()
                  );
    }

    // ~~

    async saveSettings(
        )
    {
        await this.saveData(this.settings);
    }

    // ~~

    async onload(
        )
    {
        console.log( 'Atlas plugin loaded' );

        await this.loadSettings();
/*
        this.registerEvent(
            this.app.vault.on(
                'renderPreviewFinished',
                ( file, element ) =>
                {
                    console.log( 'render preview finished' );

                    if ( file === this.app.workspace.getActiveFile() )
                    {
                        console.log( 'this is the active file' );
                    }
                }
                )
            );
*/
        this.registerMarkdownPostProcessor(
            ( element, elementData ) =>
            {
console.log( 'element', element );
console.log( 'elementData', elementData );
                let titleElement = element.querySelector( 'p' );
console.log( 'titleElement', titleElement );
                if ( titleElement )
                {
                    let activeFile = this.app.workspace.getActiveFile();
console.log( 'activeFile', activeFile );
                    let activeFilePath = activeFile.path;

                    if ( activeFilePath.endsWith( '.md' ) )
                    {
                        let superFolderArray = [];

                        if ( activeFile.parent )
                        {
                            for ( let superFolder = activeFile.parent;
                                  superFolder;
                                  superFolder = superFolder.parent )
                            {
                                if ( superFolder.path !== '/' )
                                {
                                    superFolderArray.push( superFolder );
                                }
                            }
                        }
console.log( 'superFolderArray', superFolderArray );

                        let subFolderPath = '';

                        if ( activeFilePath.indexOf( '/' ) >= 0 )
                        {
                            subFolderPath = activeFilePath.slice( 0, activeFilePath.lastIndexOf( '/' ) );
                        }
console.log( 'subFolderPath', subFolderPath );

                        let subFolder = this.app.vault.getAbstractFileByPath( subFolderPath );

                        if ( subFolder instanceof TFile )
                        {
                            subFolder = null;
                        }
console.log( 'subFolder', subFolder );
                        let subFileArray = [];

                        if ( subFolder )
                        {
                            for ( let file of subFolder.children )
                            {
                                if ( file instanceof TFile
                                     && file.parent === subFolder
                                     && file.name.endsWith( '.md' ) )
                                {
                                    subFileArray.push( file );
                                }
                            }
                        }
console.log( 'subFileArray', subFileArray );


                        let breadcrumbElement = document.createElement( 'div' );
                        breadcrumbElement.style.display = 'flex';
                        breadcrumbElement.style.gap = '0.5rem';

                        for ( let superFolderIndex = superFolderArray.length - 1;
                              superFolderIndex >= 0;
                              --superFolderIndex )
                        {
                            let superFolder = superFolderArray[ superFolderIndex ];

                            let linkElement = document.createElement( 'a' );
                            linkElement.setAttribute( 'data-tooltip-position', 'top' );
                            linkElement.setAttribute( 'aria-label', superFolder.name );
                            linkElement.setAttribute( 'data-href', superFolder.name );
                            linkElement.setAttribute( 'href', superFolder.path );
                            linkElement.setAttribute( 'class', 'internal-link' );
                            linkElement.setAttribute( 'target', '_blank' );
                            linkElement.setAttribute( 'rel', 'noopener' );
                            linkElement.textContent = superFolder.name;

                            breadcrumbElement.appendChild( linkElement );

                            if ( superFolderIndex > 0 )
                            {
                                let slashElement = document.createElement( 'span' );
                                slashElement.textContent = '/';
                                breadcrumbElement.appendChild( slashElement );
                            }
                        }
console.log( 'breadcrumbElement', breadcrumbElement );
                        titleElement.insertAdjacentElement( 'beforeBegin', breadcrumbElement );

                        let linkListElement = document.createElement( 'div' );
                        linkListElement.style.display = 'flex';
                        linkListElement.style.flexDirection = 'column';
                        linkListElement.style.gap = '0.5rem';

                        for ( let subFile of subFileArray )
                        {
                            let linkElement = document.createElement( 'a' );
                            linkElement.setAttribute( 'data-tooltip-position', 'top' );
                            linkElement.setAttribute( 'aria-label', subFile.name );
                            linkElement.setAttribute( 'data-href', subFile.name );
                            linkElement.setAttribute( 'href', subFile.path );
                            linkElement.setAttribute( 'class', 'internal-link' );
                            linkElement.setAttribute( 'target', '_blank' );
                            linkElement.setAttribute( 'rel', 'noopener' );
                            linkElement.textContent = subFile.name;
                            linkListElement.appendChild( linkElement );
                        }
console.log( 'linkListElement', linkListElement );
                        titleElement.insertAdjacentElement( 'afterEnd', linkListElement );
console.log( 'titleElement', titleElement );
                    }
                }
            }
            );

        this.addSettingTab(
            new AtlasSettingTab( this.app, this )
            );
    }

    // ~~

    onunload(
        )
    {
        console.log( 'Atlas plugin unloaded' );
    }
};
