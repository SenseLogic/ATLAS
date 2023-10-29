![](https://github.com/senselogic/ATLAS/blob/master/LOGO/atlas.png)

# Atlas

Notion-like navigation plugin for Obsidian.

## Description

In reading mode, this plugin dynamically adds a parent note list and a child note list around the opened note title.

This allows to quickly navigate up and down through the note hierarchy directly from the reading view, and also to create parent folder notes by simply clicking on them in the list.

## Installation

*   In your vault folder, create a `.obsidian/plugins/atlas` subfolder.
*   Copy `main.js`, `manifest.json` and `styles.css` inside this subfolder.
*   Enable the Atlas plugin from the `Community plugins` settings panel.

## Complementary plugins

*   Local Images Plus (Sergei Korneev) :
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
*   Fast Image Cleaner (Nathaniel).
*   Custom File Explorer Sorting (SebastianMC) :
    *   `sortspec.md`
        ```
        ---
        sorting-spec: |
          order-asc: a-z
          target-folder: /*
        ---
        ```
## Limitations

*   The folder note must have the same name as its folder.
*   The lists appear after the note content.

## Version

1.0

## Author

Eric Pelzer (ecstatic.coder@gmail.com).

## License

This project is licensed under the GNU General Public License version 3.

See the [LICENSE.md](LICENSE.md) file for details.

