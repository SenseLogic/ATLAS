![](https://github.com/senselogic/ATLAS/blob/master/LOGO/atlas.png)

# Atlas

Notion-like navigation plugin for Obsidian.

![](https://github.com/senselogic/ATLAS/blob/master/SCREENSHOT/atlas_1.png)

![](https://github.com/senselogic/ATLAS/blob/master/SCREENSHOT/atlas_2.png)

## Description

This plugin allows to emulate Notion's navigation behavior by  :
*   adding a persistent bar over the title with :
    *   a breadcrumb to open and create parent notes;
    *   a button to reveal the current note in the tree view;
    *   a button to create the note folder;
    *   a button to create a child note.
*   adding a child note link list below the title, sorted in alphabetical order;
*   adding a tree view contextual menu option to :
    *   create a note folder;
    *   create a child note.
*   keeping the note and its folder together in the tree view, sorted in :
    *   natural alphabetical order;
    *   reverse natural alphabetical order;
    *   creation time order;
    *   reverse creation time order;
    *   modification time order;
    *   reverse modification time order.

The tree view can therefore remain hidden most of the time, as the editing view can be used for navigation and note creation.

## Installation

*   In your vault folder, create a `.obsidian/plugins/atlas` subfolder.
*   Copy `main.js`, `manifest.json` and `styles.css` inside this subfolder.
*   Enable the Atlas plugin from the `Community plugins` settings panel.

## Usage

This plugin is best used :

*   On a Notion vault converted with [Topaz](https://github.com/senselogic/TOPAZ) :
    ```sh
    topaz --fix-paths --fix-newlines --fix-video-links --fix-titles --fix-indexes NOTION_EXPORT_FOLDER/ OBSIDIAN_VAULT_FOLDER/
    ```
*   With those companion plugins :
    *   Local Images Plus :
        *   Process all new markdown files : yes.
        *   Process all new attachments : yes.
        *   Use MD5 for new attachments : no.
        *   Preserve link captions : yes.
        *   Add original filename or Open file tag : no.
        *   Include : .*\.md
        *   How to write paths in tags : Relative to note.
        *   Folder to save new attachments : Next to note in the folder specified below.
        *   Media folder : ${notename)
        *   Move/delete/rename media folder : yes.
    *   Fast Image Cleaner :
        *   Deleted Attachment Destination : Move to System Trash.
    *   At Symbol Linking :
        *   Include @ symbol : no.

## Limitations

*   The folder note must have the same name as its folder.
*   The parent and child note lists appear after the note content.
*   The sort order is updated when Obsidian is restarted.

## Version

1.0

## Author

Eric Pelzer (ecstatic.coder@gmail.com).

## License

This project is licensed under the GNU General Public License version 3.

See the [LICENSE.md](LICENSE.md) file for details.

