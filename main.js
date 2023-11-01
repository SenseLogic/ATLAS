// -- IMPORTS

const { MarkdownView, Plugin, PluginSettingTab, Setting, TFile, TFolder } = require( 'obsidian' );

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
            .setName( 'Parent link height' )
            .addText(
                text =>
                text
                    .setPlaceholder( '1.5rem' )
                    .setValue( this.plugin.settings.parentLinkHeight )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkHeight = value;
                            await this.plugin.saveSettings();
                        }
                        )
                );

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
                        )
                );

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
                        )
                );

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
                        )
                );

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
                        )
                );

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
                        )
                );
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
                      parentLinkHeight : '1rem',
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

    async createNewChildNote(
        file
        )
    {
        let folderPath = file.path.slice( 0, -3 );

        if ( !this.app.vault.getAbstractFileByPath( folderPath ) )
        {
            await this.app.vault.createFolder( folderPath );
        }

        let noteName = 'New note.md';

        for ( let noteIndex = 2;
              this.app.vault.getAbstractFileByPath( folderPath + '/' + noteName );
              ++noteIndex )
        {
            noteName = 'New note ' + noteIndex + '.md'
        }

        await this.app.vault.create( folderPath + '/' + noteName, '' );

        this.app.workspace.openLinkText( noteName, folderPath, true );
    }

    // ~~

    getContentElement(
        )
    {
        let activeView = app.workspace.activeLeaf?.view;

        if ( activeView instanceof MarkdownView )
        {
            return activeView.contentEl;
        }
        else
        {
            return null;
        }
    }

    // ~~

    removeTitleElements(
        )
    {
        for ( let fileListElement of document.querySelectorAll( '#atlas-plugin-file-list' ) )
        {
            fileListElement.remove();
        }
    }

    // ~~

    clearTitle(
        )
    {
        this.titleElementByContentElementMap = {};
        this.removeTitleElements();
    }

    // ~~

    updateTitle(
        )
    {
        let contentElement = this.getContentElement();

        if ( contentElement )
        {
            let titleElement = this.titleElementByContentElementMap[ contentElement ];

            if ( !titleElement )
            {
                titleElement = contentElement.querySelector( '.inline-title' );

                if ( titleElement )
                {
                    let mode = app.workspace.activeLeaf?.getViewState()?.state?.mode;

                    if ( mode == 'preview' )
                    {
                        this.titleElementByContentElementMap[ contentElement ] = titleElement;
                        this.removeTitleElements();

                        let activeFile = this.app.workspace.getActiveFile();
                        let activeFilePath = activeFile.path;

                        if ( activeFilePath.endsWith( '.md' ) )
                        {
                            let parentFolderArray = [];

                            if ( activeFile.parent )
                            {
                                for ( let parentFolder = activeFile.parent;
                                      parentFolder;
                                      parentFolder = parentFolder.parent )
                                {
                                    if ( parentFolder.path !== '/' )
                                    {
                                        parentFolderArray.push( parentFolder );
                                    }
                                }
                            }

                            let childFolderPath = activeFilePath.slice( 0, -3 );
                            let childFolder = this.app.vault.getAbstractFileByPath( childFolderPath );
                            let childFileArray = [];

                            if ( childFolder
                                 && childFolder instanceof TFolder )
                            {
                                for ( let file of childFolder.children )
                                {
                                    if ( file instanceof TFile
                                         && file.parent === childFolder
                                         && file.name.endsWith( '.md' ) )
                                    {
                                        childFileArray.push( file );
                                    }
                                }
                            }

                            if ( parentFolderArray.length >= 0 )
                            {
                                let parentFileListElement = document.createElement( 'div' );
                                parentFileListElement.id = 'atlas-plugin-file-list';
                                parentFileListElement.style.display = 'flex';
                                parentFileListElement.style.flexWrap = 'wrap';
                                parentFileListElement.style.gap = this.settings.parentLinkGap;
                                parentFileListElement.style.fontSize = this.settings.parentLinkFontSize;
                                parentFileListElement.style.transform = 'translateY(-' + this.settings.parentLinkHeight + ')';
                                parentFileListElement.style.marginBottom = '-' + this.settings.parentLinkHeight;
                                parentFileListElement.style.lineHeight = this.settings.parentLinkHeight;

                                for ( let parentFolderIndex = parentFolderArray.length - 1;
                                      parentFolderIndex >= 0;
                                      --parentFolderIndex )
                                {
                                    let parentFolder = parentFolderArray[ parentFolderIndex ];

                                    let linkElement = document.createElement( 'a' );
                                    linkElement.setAttribute( 'class', 'internal-link' );
                                    linkElement.setAttribute( 'data-href', parentFolder.path );
                                    linkElement.setAttribute( 'data-tooltip-position', 'top' );
                                    linkElement.setAttribute( 'aria-label', parentFolder.name );
                                    linkElement.setAttribute( 'href', parentFolder.path );
                                    linkElement.setAttribute( 'rel', 'noopener' );
                                    linkElement.setAttribute( 'target', '_blank' );
                                    linkElement.textContent = parentFolder.name;

                                    if ( mode === 'source' )
                                    {
                                        this.registerDomEvent(
                                            linkElement,
                                            'click',
                                            () =>
                                            {
                                                this.app.workspace.openLinkText( parentFolder.name, parentFolder.path + '.md', false );
                                            }
                                            );
                                    }

                                    parentFileListElement.appendChild( linkElement );

                                    if ( parentFolderIndex > 0 )
                                    {
                                        let slashElement = document.createElement( 'span' );
                                        slashElement.textContent = '/';
                                        parentFileListElement.appendChild( slashElement );
                                    }
                                }

                                let buttonElement = document.createElement( 'div' );
                                buttonElement.style.marginLeft= 'auto';
                                buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="18" height="18" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/></g></svg>';

                                let svgElement = buttonElement.querySelector( 'svg' );
                                svgElement.style.height = this.settings.parentLinkFontSize;
                                svgElement.style.width = this.settings.parentLinkFontSize;

                                this.registerDomEvent(
                                    buttonElement,
                                    'click',
                                    () =>
                                    {
                                        this.app.commands.executeCommandById( 'file-explorer:reveal-active-file' );
                                    }
                                    );

                                parentFileListElement.appendChild( buttonElement );

                                buttonElement = document.createElement( 'div' );
                                buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';

                                svgElement = buttonElement.querySelector( 'svg' );
                                svgElement.style.height = this.settings.parentLinkFontSize;
                                svgElement.style.width = this.settings.parentLinkFontSize;

                                this.registerDomEvent(
                                    buttonElement,
                                    'click',
                                    () =>
                                    {
                                        this.createNewChildNote( activeFile );
                                    }
                                    );

                                parentFileListElement.appendChild( buttonElement );

                                titleElement.insertAdjacentElement( 'beforeBegin', parentFileListElement );
                            }

                            if ( childFileArray.length > 0 )
                            {
                                let childFileListElement = document.createElement( 'div' );
                                childFileListElement.id = 'atlas-plugin-file-list';
                                childFileListElement.style.display = 'flex';
                                childFileListElement.style.flexDirection = 'column';
                                childFileListElement.style.gap = this.settings.childLinkGap;
                                childFileListElement.style.fontSize = this.settings.childFontSize;

                                for ( let childFile of childFileArray )
                                {
                                    let linkElement = document.createElement( 'a' );
                                    linkElement.setAttribute( 'class', 'internal-link' );
                                    linkElement.setAttribute( 'data-href', childFile.path );
                                    linkElement.setAttribute( 'data-tooltip-position', 'top' );
                                    linkElement.setAttribute( 'aria-label', childFile.name );
                                    linkElement.setAttribute( 'href', childFile.path );
                                    linkElement.setAttribute( 'rel', 'noopener' );
                                    linkElement.setAttribute( 'target', '_blank' );
                                    linkElement.textContent = childFile.name.slice( 0, -3 );

                                    if ( mode === 'source' )
                                    {
                                        this.registerDomEvent(
                                            linkElement,
                                            'click',
                                            () =>
                                            {
                                                this.app.workspace.openLinkText( childFile.name, childFile.path, false );
                                            }
                                            );
                                    }

                                    childFileListElement.appendChild( linkElement );
                                }

                                titleElement.insertAdjacentElement( 'afterEnd', childFileListElement );
                            }
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

        this.titleElementByContentElementMap = {};

        this.registerEvent(
            this.app.workspace.on(
                'file-menu',
                ( menu, file ) =>
                {
                    if ( file.extension === 'md' )
                    {
                        menu.addItem(
                            ( item ) =>
                            {
                                item.setTitle( 'New child note' )
                                .setIcon( 'plus-with-circle' )
                                .onClick( () => this.createNewChildNote( file ) );
                            }
                            );
                    }
                }
                )
            );

        this.app.workspace.onLayoutReady(
            () =>
            {
                this.clearTitle();
            }
            );

        this.registerEvent(
            this.app.workspace.on(
                'window-open',
                () =>
                {
                    this.clearTitle();
                }
                )
            );

        this.registerEvent(
            this.app.workspace.on(
                'file-open',
                () =>
                {
                    this.clearTitle();
                }
                )
            );

        this.registerEvent(
            this.app.workspace.on(
                'editor-change',
                () =>
                {
                    this.clearTitle();
                }
                )
            );

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
                'css-change',
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
