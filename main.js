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
            .setName( 'Parent link translation' )
            .addText(
                text =>
                text
                    .setPlaceholder( '-1rem' )
                    .setValue( this.plugin.settings.parentLinkTranslation )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkTranslation = value;
                            await this.plugin.saveSettings();
                        }
                ) );

        new Setting( containerEl )
            .setName( 'Parent link font size' )
            .addText(
                text =>
                text
                    .setPlaceholder( '0.8rem' )
                    .setValue( this.plugin.settings.parentLinkFontSize )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkFontSize = value;
                            await this.plugin.saveSettings();
                        }
                ) );

        new Setting( containerEl )
            .setName( 'Parent link gap' )
            .addText(
                text =>
                text
                    .setPlaceholder( '0.5rem' )
                    .setValue( this.plugin.settings.parentLinkGap )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkGap = value;
                            await this.plugin.saveSettings();
                        }
                ) );

        new Setting( containerEl )
            .setName( 'Child link font size' )
            .addText(
                text =>
                text
                    .setPlaceholder( '1rem' )
                    .setValue( this.plugin.settings.childLinkFontSize )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.childLinkFontSize = value;
                            await this.plugin.saveSettings();
                        }
                ) );

        new Setting( containerEl )
            .setName( 'Child link gap' )
            .addText(
                text =>
                text
                    .setPlaceholder( '1rem' )
                    .setValue( this.plugin.settings.childLinkGap )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.childLinkGap = value;
                            await this.plugin.saveSettings();
                        }
                ) );

        new Setting( containerEl )
            .setName( 'Update interval' )
            .addText(
                text =>
                text
                    .setPlaceholder( '250' )
                    .setValue( this.plugin.settings.updateInterval )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.updateInterval = value;
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
                      parentLinkTranslation : '-1rem',
                      parentLinkFontSize: '0.8rem',
                      parentLinkGap: '0.5rem',
                      childLinkFontSize: '1rem',
                      childLinkGap: '1rem',
                      updateInterval: '250'
                  },
                  await this.loadData()
                  );
    }

    // ~~

    async saveSettings(
        )
    {
        await this.saveData( this.settings );
    }

    // ~~

    clearTitle(
        )
    {
        this.titleElement = null;

        let parentFileListElement = document.getElementById( 'atlas-parentFileList' );
        let childFileListElement = document.getElementById( 'atlas-link-list' );

        if ( parentFileListElement )
        {
            parentFileListElement.remove();
        }

        if ( childFileListElement )
        {
            childFileListElement.remove();
        }
    }

    // ~~

    updateTitle(
        )
    {
        if ( !this.titleElement )
        {
            this.titleElement = document.querySelector( '.inline-title' );

            if ( this.titleElement )
            {
                let mode = app.workspace.activeLeaf?.getViewState()?.state?.mode;

                if ( mode === 'preview' )
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
                            let parentFileListElement = document.createElement( 'div' );
                            parentFileListElement.setAttribute( 'id', 'atlas-parentFileList' );
                            parentFileListElement.style.display = 'flex';
                            parentFileListElement.style.gap = this.settings.parentLinkGap;
                            parentFileListElement.style.fontSize = this.settings.parentLinkFontSize;
                            parentFileListElement.style.transform = 'translateY(' + this.settings.parentLinkTranslation + ')';
                            parentFileListElement.style.position = 'absolute';

                            for ( let superFolderIndex = superFolderArray.length - 1;
                                  superFolderIndex >= 0;
                                  --superFolderIndex )
                            {
                                let superFolder = superFolderArray[ superFolderIndex ];

                                let linkElement = document.createElement( 'a' );
                                linkElement.setAttribute( 'class', 'internal-link' );
                                linkElement.setAttribute( 'data-href', superFolder.path );
                                linkElement.setAttribute( 'data-tooltip-position', 'top' );
                                linkElement.setAttribute( 'aria-label', superFolder.name );
                                linkElement.setAttribute( 'href', superFolder.path );
                                linkElement.setAttribute( 'rel', 'noopener' );
                                linkElement.setAttribute( 'target', '_blank' );
                                linkElement.textContent = superFolder.name;

                                parentFileListElement.appendChild( linkElement );

                                if ( superFolderIndex > 0 )
                                {
                                    let slashElement = document.createElement( 'span' );
                                    slashElement.textContent = '/';
                                    parentFileListElement.appendChild( slashElement );
                                }
                            }

                            this.titleElement.insertAdjacentElement( 'beforeBegin', parentFileListElement );
                        }

                        if ( subFileArray.length >= 0 )
                        {
                            let childFileListElement = document.createElement( 'div' );
                            childFileListElement.setAttribute( 'id', 'atlas-link-list' );
                            childFileListElement.style.display = 'flex';
                            childFileListElement.style.flexDirection = 'column';
                            childFileListElement.style.gap = this.settings.childLinkGap;
                            childFileListElement.style.fontSize = this.settings.childFontSize;

                            for ( let subFile of subFileArray )
                            {
                                let linkElement = document.createElement( 'a' );
                                linkElement.setAttribute( 'class', 'internal-link' );
                                linkElement.setAttribute( 'data-href', subFile.path );
                                linkElement.setAttribute( 'data-tooltip-position', 'top' );
                                linkElement.setAttribute( 'aria-label', subFile.name );
                                linkElement.setAttribute( 'href', subFile.path );
                                linkElement.setAttribute( 'rel', 'noopener' );
                                linkElement.setAttribute( 'target', '_blank' );
                                linkElement.textContent = subFile.name.slice( 0, -3 );
                                childFileListElement.appendChild( linkElement );
                            }

                            this.titleElement.insertAdjacentElement( 'afterEnd', childFileListElement );
                        }
                    }
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

        this.titleElement = null;

        this.registerEvent(
            this.app.workspace.on(
                'layout-change',
                () =>
                {
                    this.clearTitle();
                }
                )
            );

        this.registerEvent(
            this.app.workspace.on(
                'layout-ready',
                () =>
                {
                    this.clearTitle();
                }
                )
            );

        this.registerEvent(
            this.app.workspace.on(
                'active-leaf-change',
                () =>
                {
                    this.clearTitle();
                }
                )
            );

        this.registerInterval(
            window.setInterval(
                () => this.updateTitle(),
                parseInt( this.settings.updateInterval )
                )
            );

        this.addSettingTab(
            new AtlasSettingTab( this.app, this )
            );

        this.app.workspace.trigger( 'layout-change' );
    }

    // ~~

    onunload(
        )
    {
        console.log( 'Atlas plugin unloaded' );
    }
};
