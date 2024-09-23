// -- IMPORTS

const { exec } = require( 'child_process' );
const path = require( 'path' );
const { MarkdownView, Plugin, PluginSettingTab, Setting, TFile, TFolder } = require( 'obsidian' );

// -- FUNCTIONS

function getAscendingNameChildComparison(
    firstChild,
    secondChild
    )
{
    return firstChild.file.path.localeCompare( secondChild.file.path, undefined, { numeric: true } );
}

// ~~

function getDescendingNameChildComparison(
    firstChild,
    secondChild
    )
{
    return -getAscendingNameChildComparison( firstChild, secondChild );
}

// ~~

function getAscendingCreationTimeChildComparison(
    firstChild,
    secondChild
    )
{
    if ( firstChild.file.stat
         && secondChild.file.stat )
    {
        return firstChild.file.stat.ctime - secondChild.file.stat.ctime;
    }
    else
    {
        return 0;
    }
}

// ~~

function getDescendingCreationTimeChildComparison(
    firstChild,
    secondChild
    )
{
    return -getCreationTimeChildComparison( firstChild, secondChild );
}

// ~~

function getAscendingModificationTimeChildComparison(
    firstChild,
    secondChild
    )
{
    if ( firstChild.file.stat
         && secondChild.file.stat )
    {
        return firstChild.file.stat.mtime - secondChild.file.stat.mtime;
    }
    else
    {
        return 0;
    }
}

// ~~

function getDescendingModificationTimeChildComparison(
    firstChild,
    secondChild
    )
{
    return -getModificationTimeChildComparison( firstChild, secondChild );
}

// ~~

function getFolderPath(
    filePath
    )
{
    let slashCharacterIndex = filePath.lastIndexOf( '/' );

    if ( slashCharacterIndex >= 0 )
    {
        return filePath.slice( 0, slashCharacterIndex );
    }
    else
    {
        return "";
    }
}

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
            .setName( 'Parent link background color' )
            .addText(
                text =>
                text
                    .setPlaceholder( '#FAFAFA' )
                    .setValue( this.plugin.settings.parentLinkBackgroundColor )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkBackgroundColor = value;
                            await this.plugin.saveSettings();
                        }
                        )
                );

        new Setting( containerEl )
            .setName( 'Parent link translation' )
            .addText(
                text =>
                text
                    .setPlaceholder( '-2rem' )
                    .setValue( this.plugin.settings.parentLinkTranslation )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkTranslation = value;
                            await this.plugin.saveSettings();
                        }
                        )
                );

        new Setting( containerEl )
            .setName( 'Parent link padding' )
            .addText(
                text =>
                text
                    .setPlaceholder( '0.5rem' )
                    .setValue( this.plugin.settings.parentLinkPadding )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.parentLinkPadding = value;
                            await this.plugin.saveSettings();
                        }
                        )
                );

        new Setting( containerEl )
            .setName( 'Parent link height' )
            .addText(
                text =>
                text
                    .setPlaceholder( '1rem' )
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

        new Setting( containerEl )
            .setName( 'Sort order' )
            .addDropdown(
                ( dropdown ) =>
                dropdown
                    .addOption( 'system', 'System' )
                    .addOption( 'ascendingName', 'Ascending name' )
                    .addOption( 'descendingName', 'Descending name' )
                    .addOption( 'ascendingCreationTime', 'Ascending creation time' )
                    .addOption( 'descendingCreationTime', 'Descending creation time' )
                    .addOption( 'ascendingModificationTime', 'Ascending modification time' )
                    .addOption( 'descendingModificationTime', 'Descending  modification time' )
                    .setValue( this.plugin.settings.sortOrder )
                    .onChange(
                        async ( value ) =>
                        {
                            this.plugin.settings.sortOrder = value;
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
                      parentLinkBackgroundColor : '#FAFAFA',
                      parentLinkTranslation : '-2rem',
                      parentLinkPadding : '0.5rem',
                      parentLinkHeight : '1rem',
                      parentLinkFontSize: '0.8rem',
                      parentLinkGap: '0.5rem',
                      childLinkFontSize: '1rem',
                      childLinkGap: '1rem',
                      updateInterval: '250',
                      sortOrder : 'ascendingName'
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

    async openNoteFolder(
        file
        )
    {
        if ( file !== null
             && file.parent !== null )
        {
            let vaultBasePath = this.app.vault.adapter.getBasePath();
            let folderPath = path.normalize( path.join( vaultBasePath, file.parent.path ) );
            let command;

            if ( process.platform === 'win32' )
            {
                command = `explorer "${ folderPath }"`;
            }
            else if ( process.platform === 'darwin' )
            {
                command = `open "${ folderPath }"`;
            }
            else
            {
                command = `xdg-open "${ folderPath }"`;
            }

            exec( command );
        }
    }

    // ~~

    async createNoteFolder(
        file
        )
    {
        let folderPath = file.path.slice( 0, -3 );

        if ( !this.app.vault.getAbstractFileByPath( folderPath ) )
        {
            await this.app.vault.createFolder( folderPath );
        }
    }

    // ~~

    async createChildNote(
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
            noteName = 'New note ' + noteIndex + '.md';
        }

        await this.app.vault.create( folderPath + '/' + noteName, '' );

        this.app.workspace.openLinkText( noteName, folderPath, true );

        let self = this;

        setTimeout(
            function ()
            {
                let contentElement = self.getContentElement();

                if ( contentElement )
                {
                    let titleElement = contentElement.querySelector( '.inline-title' );

                    if ( titleElement )
                    {
                        titleElement.focus();

                        var range = document.createRange();
                        range.selectNodeContents(titleElement);

                        var selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            },
            350
            );
    }

    // ~~

    async createFolderNote(
        file
        )
    {
        let filePath = file.path + ".md";

        if ( !this.app.vault.getAbstractFileByPath( filePath ) )
        {
            await this.app.vault.create( filePath, '' );

            this.app.workspace.openLinkText( file.name, getFolderPath( filePath ), true );
        }
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

    updateTitle(
        eventName
        )
    {
        if ( eventName !== undefined )
        {
            this.titleElementByContentElementMap = {};
        }

        let contentElement = this.getContentElement();

        if ( contentElement )
        {
            let titleElement = this.titleElementByContentElementMap[ contentElement ];

            if ( !titleElement )
            {
                titleElement = contentElement.querySelector( '.inline-title' );

                if ( titleElement )
                {
                    let activeLeaf = app.workspace.activeLeaf;
                    let mode = activeLeaf?.getViewState()?.state?.mode;

                    if ( mode === 'source'
                         || mode === 'preview' )
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

                                childFileArray.sort(
                                    ( firstFile, secondFile ) =>
                                    firstFile.name.localeCompare( secondFile.name, undefined, { numeric: true } )
                                    );
                            }

                            if ( parentFolderArray.length >= 0 )
                            {
                                let parentFileListElement = document.createElement( 'div' );
                                parentFileListElement.id = 'atlas-plugin-file-list';
                                parentFileListElement.style.marginBottom = '-' + this.settings.parentLinkHeight;
                                parentFileListElement.style.display = 'flex';
                                parentFileListElement.style.flexWrap = 'wrap';
                                parentFileListElement.style.gap = this.settings.parentLinkGap;
                                parentFileListElement.style.position = 'sticky';
                                parentFileListElement.style.top = '0';
                                parentFileListElement.style.zIndex = '1';
                                parentFileListElement.style.paddingBottom = this.settings.parentLinkPadding;
                                parentFileListElement.style.backgroundColor = this.settings.parentLinkBackgroundColor;
                                parentFileListElement.style.lineHeight = this.settings.parentLinkHeight;
                                parentFileListElement.style.fontSize = this.settings.parentLinkFontSize;
                                parentFileListElement.style.transform = 'translateY(' + this.settings.parentLinkTranslation + ')';

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
                                buttonElement.style.marginLeft = 'auto';
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

                                        setTimeout(
                                            () =>
                                            {
                                                this.app.commands.executeCommandById( 'file-explorer:reveal-active-file' );
                                            },
                                            50
                                            );

                                        setTimeout(
                                            () =>
                                            {
                                                this.app.workspace.setActiveLeaf(
                                                    activeLeaf,
                                                    {
                                                        focus: true,
                                                    }
                                                    );
                                            },
                                            200
                                            );
                                    }
                                    );

                                parentFileListElement.appendChild( buttonElement );

                                buttonElement = document.createElement( 'div' );
                                buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-folder"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M22 6H12"/></svg>';

                                svgElement = buttonElement.querySelector( 'svg' );
                                svgElement.style.height = this.settings.parentLinkFontSize;
                                svgElement.style.width = this.settings.parentLinkFontSize;

                                this.registerDomEvent(
                                    buttonElement,
                                    'click',
                                    () =>
                                    {
                                        this.openNoteFolder( activeFile );
                                    }
                                    );

                                parentFileListElement.appendChild( buttonElement );

                                buttonElement = document.createElement( 'div' );
                                buttonElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-folder-plus"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><line x1="12" y1="10" x2="12" y2="16"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>';

                                svgElement = buttonElement.querySelector( 'svg' );
                                svgElement.style.height = this.settings.parentLinkFontSize;
                                svgElement.style.width = this.settings.parentLinkFontSize;

                                this.registerDomEvent(
                                    buttonElement,
                                    'click',
                                    () =>
                                    {
                                        this.createNoteFolder( activeFile );
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
                                        this.createChildNote( activeFile );
                                    }
                                    );

                                parentFileListElement.appendChild( buttonElement );

                                titleElement.insertAdjacentElement( 'beforeBegin', parentFileListElement );
                            }

                            if ( childFileArray.length > 0 )
                            {
                                let childFileListElement = document.createElement( 'div' );
                                childFileListElement.id = 'atlas-plugin-file-list';
                                childFileListElement.style.marginBottom = this.settings.childLinkGap;
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

                                let separatorElement = document.createElement( 'hr' );
                                separatorElement.style.marginTop = '0.5rem';
                                childFileListElement.appendChild( separatorElement );

                                titleElement.insertAdjacentElement( 'afterEnd', childFileListElement );
                            }
                        }
                    }
                }
            }
        }
    }

    // ~~

    updateFileExplorer(
        )
    {
        let fileExplorer = app.workspace.getLeavesOfType( "file-explorer" )?.first()?.view;

        if ( fileExplorer )
        {
            let sortOrder = this.settings.sortOrder;

            if ( sortOrder !== 'system' )
            {
                let getChildComparisonFunction;

                if ( sortOrder == 'ascendingName' )
                {
                    getChildComparisonFunction = getAscendingNameChildComparison;
                }
                else if ( sortOrder == 'descendingName' )
                {
                    getChildComparisonFunction = getDescendingNameChildComparison;
                }
                else if ( sortOrder === 'ascendingCreationTime' )
                {
                    getChildComparisonFunction = getAscendingCreationTimeChildComparison;
                }
                else if ( sortOrder === 'descendingCreationTime' )
                {
                    getChildComparisonFunction = getDescendingCreationTimeChildComparison;
                }
                else if ( sortOrder === 'ascendingModificationTime' )
                {
                    getChildComparisonFunction = getAscendingModificationTimeChildComparison;
                }
                else if ( sortOrder === 'descendingModificationTime' )
                {
                    getChildComparisonFunction = getDescendingModificationTimeChildComparison;
                }
                else
                {
                    console.warn( 'Invalid sort order : ', sortOrder );

                    return;
                }

                for ( let fileItem of Object.values( fileExplorer.fileItems ) )
                {
                    if ( fileItem.vChildren?._children
                         && fileItem.vChildren._children.length > 1 )
                    {
                        let childArray = [];

                        for ( let child of fileItem.vChildren._children )
                        {
                            childArray.push( child );
                        }

                        childArray.sort(
                            ( firstChild, secondChild ) =>
                            {
                                if ( firstChild.file.path === secondChild.file.path + '.md' )
                                {
                                    return -1;
                                }
                                else if ( secondChild.file.path === firstChild.file.path + '.md' )
                                {
                                    return 1;
                                }
                                else
                                {
                                    return getChildComparisonFunction( firstChild, secondChild );
                                }
                            }
                            );

                        fileItem.vChildren.setChildren( childArray );
                    }
                }
            }
        }
    }

    // ~~

    async onload(
        )
    {
        console.log( 'Atlas plugin loading' );

        await this.loadSettings();

        this.titleElementByContentElementMap = {};

        this.registerEvent(
            this.app.workspace.on(
                'file-menu',
                ( menu, file ) =>
                {
                    if ( file instanceof TFile
                         && file.extension === 'md' )
                    {
                        menu.addItem(
                            ( item ) =>
                            {
                                item.setTitle( 'Create note folder' )
                                .setIcon( 'lucide-folder-plus' )
                                .onClick( () => this.createNoteFolder( file ) );
                            }
                            );

                        menu.addItem(
                            ( item ) =>
                            {
                                item.setTitle( 'Create child note' )
                                .setIcon( 'plus-with-circle' )
                                .onClick( () => this.createChildNote( file ) );
                            }
                            );
                    }

                    if ( file instanceof TFolder )
                    {
                        menu.addItem(
                            ( item ) =>
                            {
                                item.setTitle( 'Create folder note' )
                                .setIcon( 'lucide-file-plus' )
                                .onClick( () => this.createFolderNote( file ) );
                            }
                            );
                    }
                }
                )
            );

        this.app.workspace.onLayoutReady(
            () =>
            {
                this.updateTitle( 'layout-ready' );

                this.registerEvent(
                    this.app.workspace.on(
                        'window-open',
                        () =>
                        {
                            this.updateTitle( 'window-open' );
                            this.updateFileExplorer();
                        }
                        )
                    );

                this.registerEvent(
                    this.app.workspace.on(
                        'file-open',
                        () =>
                        {
                            this.updateTitle( 'file-open' );
                            this.updateFileExplorer();
                        }
                        )
                    );

                this.registerEvent(
                    this.app.workspace.on(
                        'active-leaf-change',
                        () =>
                        {
                            this.updateTitle( 'active-leaf-change' );
                            this.updateFileExplorer();
                        }
                        )
                    );

                this.registerEvent(
                    this.app.workspace.on(
                        'layout-change',
                        () =>
                        {
                            this.updateTitle( 'layout-change' );
                            this.updateFileExplorer();
                        }
                        )
                    );

                this.registerEvent(
                    this.app.workspace.on(
                        'rename',
                        () =>
                        {
                            this.updateTitle( 'rename' );
                            this.updateFileExplorer();
                        }
                        )
                    );

                this.registerEvent(
                    this.app.workspace.on(
                        'delete',
                        () =>
                        {
                            this.updateTitle( 'delete' );
                            this.updateFileExplorer();
                        }
                        )
                    );

                this.registerInterval(
                    window.setInterval(
                        () => this.updateTitle(),
                        parseInt( this.settings.updateInterval )
                        )
                    );
            }
            );

        this.addSettingTab(
            new AtlasSettingTab( this.app, this )
            );

        this.app.workspace.trigger( 'layout-change' );

        console.log( 'Atlas plugin loaded' );
    }

    // ~~

    onunload(
        )
    {
        console.log( 'Atlas plugin unloaded' );
    }
};
