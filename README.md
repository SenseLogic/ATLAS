![](https://github.com/senselogic/ATLAS/blob/master/LOGO/atlas.png)

# Atlas

Notion-like navigation plugin for Obsidian.

![](https://github.com/senselogic/ATLAS/blob/master/SCREENSHOT/atlas_1.png)

![](https://github.com/senselogic/ATLAS/blob/master/SCREENSHOT/atlas_2.png)

## Description

This plugin allows to emulate Notion's navigation behavior by :
*   Adding a persistent bar over the title with :
    *   a breadcrumb to open and create parent notes;
    *   a button to reveal the note in the tree view;
    *   a button to open the note parent folder;
    *   a button to create the note folder;
    *   a button to create a child note.
*   Adding a child note link list below the title, sorted in alphabetical order.
*   Adding tree view contextual menu options to :
    *   create a folder note;
    *   create a note folder;
    *   create a child note.
*   Keeping the note and its folder together in the tree view, sorted in either :
    *   natural alphabetical order;
    *   reverse natural alphabetical order;
    *   creation time order;
    *   reverse creation time order;
    *   modification time order;
    *   reverse modification time order.

The tree view can thus remain hidden most of the time, since the editing view is now also used for navigation and note creation.

## Installation

*   In your vault folder, create a `.obsidian/plugins/atlas` subfolder.
*   Copy `main.js`, `manifest.json` and `styles.css` inside this subfolder.
*   Enable the Atlas plugin from the `Community plugins` settings panel.

## Usage

This plugin is meant to be used :

*   On a Notion vault converted with [Topaz](https://github.com/senselogic/TOPAZ) :
    ```sh
    topaz --fix-paths --fix-newlines --fix-video-links --fix-titles --fix-indexes NOTION_EXPORT_FOLDER/ OBSIDIAN_VAULT_FOLDER/
    ```
*   In synergy with the following plugins :
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

## Known issues

Due to Obsidian capricious behavior :
*   The parent note links and buttons sometimes need a second click;
*   The child note list is not always immediately refreshed.

## Version

1.0

## Author

Eric Pelzer (ecstatic.coder@gmail.com).

## License

This project is licensed under the GNU General Public License version 3.

See the [LICENSE.md](LICENSE.md) file for details.

