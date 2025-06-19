# Page snapshot

```yaml
- navigation:
  - link "BDPADrive":
    - /url: /explorer
  - list:
    - listitem:
      - link "Dashboard":
        - /url: /dashboard
    - listitem:
      - link "Logoff":
        - /url: /logout
- heading "Explorer" [level=1]
- text: "Sort by:"
- combobox "Sort by:":
  - option "Name" [selected]
  - option "Created"
  - option "Modified"
  - option "Size"
- heading "Create New" [level=2]
- text: "Type:"
- combobox "Type:":
  - option "Text File" [selected]
  - option "Folder"
  - option "Symlink"
- text: "Name:"
- textbox "Name:"
- text: "Tags (comma separated, max 5):"
- textbox "Tags (comma separated, max 5):"
- text: "Text (max 10KiB):"
- textbox "Text (max 10KiB):"
- button "Create"
```