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

    updateTitle(
        )
    {
        let oldBreadcrumbElement = document.getElementById( 'atlas-breadcrumb' );
        let oldLinkListElement = document.getElementById( 'atlas-link-list' );

        if ( oldBreadcrumbElement )
        {
            oldBreadcrumbElement.remove();
        }

        if ( oldLinkListElement )
        {
            oldLinkListElement.remove();
        }

        let titleElement = document.querySelector( '.inline-title' );
        let mode = app.workspace.activeLeaf.getViewState().state.mode;

        if ( titleElement
             && mode === 'preview' )
        {
            let activeFile = this.app.workspace.getActiveFile();
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

                let subFolderPath = activeFilePath.slice( 0, -3 );
                let subFolder = this.app.vault.getAbstractFileByPath( subFolderPath );
                let subFileArray = [];

                if ( subFolder
                     && subFolder instanceof TFolder )
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

                if ( superFolderArray.length >= 0 )
                {
                    let breadcrumbElement = document.createElement( 'div' );
                    breadcrumbElement.setAttribute( 'id', 'atlas-breadcrumb' );
                    breadcrumbElement.style.display = 'flex';
                    breadcrumbElement.style.gap = '0.5rem';
                    breadcrumbElement.style.fontSize = '0.7rem';
                    breadcrumbElement.style.transform = 'translateY(-20px)';
                    breadcrumbElement.style.position = 'absolute';

                    for ( let superFolderIndex = superFolderArray.length - 1;
                          superFolderIndex >= 0;
                          --superFolderIndex )
                    {
                        let superFolder = superFolderArray[ superFolderIndex ];

                        let linkElement = document.createElement( 'a' );
                        linkElement.setAttribute( 'class', 'internal-link' );
                        linkElement.setAttribute( 'data-href', superFolder.name );
                        linkElement.setAttribute( 'data-tooltip-position', 'top' );
                        linkElement.setAttribute( 'aria-label', superFolder.name );
                        linkElement.setAttribute( 'href', superFolder.path );
                        linkElement.setAttribute( 'rel', 'noopener' );
                        linkElement.setAttribute( 'target', '_blank' );
                        linkElement.textContent = superFolder.name;

                        breadcrumbElement.appendChild( linkElement );

                        if ( superFolderIndex > 0 )
                        {
                            let slashElement = document.createElement( 'span' );
                            slashElement.textContent = '/';
                            breadcrumbElement.appendChild( slashElement );
                        }
                    }

                    titleElement.insertAdjacentElement( 'beforeBegin', breadcrumbElement );
                }

                if ( subFileArray.length >= 0 )
                {
                    let linkListElement = document.createElement( 'div' );
                    linkListElement.setAttribute( 'id', 'atlas-link-list' );
                    linkListElement.style.display = 'flex';
                    linkListElement.style.flexDirection = 'column';
                    linkListElement.style.gap = '0.5rem';
                    linkListElement.style.fontSize = '0.7rem';

                    for ( let subFile of subFileArray )
                    {
                        let linkElement = document.createElement( 'a' );
                        linkElement.setAttribute( 'class', 'internal-link' );
                        linkElement.setAttribute( 'data-href', subFile.name.slice( 0, -3 ) );
                        linkElement.setAttribute( 'data-tooltip-position', 'top' );
                        linkElement.setAttribute( 'aria-label', subFile.name.slice( 0, -3 ) );
                        linkElement.setAttribute( 'href', subFile.path );
                        linkElement.setAttribute( 'rel', 'noopener' );
                        linkElement.setAttribute( 'target', '_blank' );
                        linkElement.textContent = subFile.name;
                        linkListElement.appendChild( linkElement );
                    }

                    titleElement.insertAdjacentElement( 'afterEnd', linkListElement );
                }
            }
        }
    }

    // ~~

    async onload(
        )
    {
        console.log( 'Atlas plugin loaded' );

        await this.loadSettings();

        this.registerEvent(
            this.app.workspace.on(
                'layout-change',
                () =>
                {
                    this.updateTitle();
                }
                )
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
