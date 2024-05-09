
import * as vscode from 'vscode';
import path = require('path');
var rootPath: string | undefined;
export class ToolDataProvider implements vscode.TreeDataProvider<Tool | ToolGroup>{
    private tools: Array<Command | Array<Command>> = [];
    private keys = new Map();
    constructor(public context: vscode.ExtensionContext) {
        this.obtainData(context);
    }
    private _onDidChangeTreeData: vscode.EventEmitter<Tool | null | undefined> = new vscode.EventEmitter<Tool | null | undefined>();
    readonly onDidChangeTreeData?: vscode.Event<void | Tool | null | undefined> | undefined = this._onDidChangeTreeData.event;
    private obtainData(context: vscode.ExtensionContext) {
        rootPath = context.extensionPath;
        const config = vscode.workspace.getConfiguration();
        const judges = new Map<string, boolean>();
        context.extension.packageJSON.contributes.commands.forEach((cmd: Command) => {
            const keys = this.keys;
            if (!keys.has(cmd.category)) {
                keys.set(cmd.category, this.tools.length);
                this.tools.push(Array<Command>());
            }
            (this.tools[keys.get(cmd.category)] as Command[])
                .push(cmd);
        });
    }

    getTreeItem(element: Tool | ToolGroup): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: Tool | ToolGroup): vscode.ProviderResult<Tool[] | ToolGroup[]> {
        if (element instanceof ToolGroup) {
            const tools = (this.tools[this.keys.get(element.label)] as Command[])
                .map(cmd => { return new Tool(cmd); });
            return Promise.resolve(tools);
        } else if (element) {
            return Promise.resolve(new Array<Tool>());
        } else {
            return Promise.resolve(this.tools.map(e => {
                if ("title" in e) {
                    return new Tool(e);
                } else {
                    return new ToolGroup(e[0].category);
                }
            }));
        };
    }

}
type Command = vscode.Command & { category: string };
class ToolGroup extends vscode.TreeItem {
    constructor(category: string) {
        super(category, vscode.TreeItemCollapsibleState.Collapsed);
    }
}
class Tool extends vscode.TreeItem {
    constructor(public command: Command) {
        super(command.title, vscode.TreeItemCollapsibleState.None);
    }
    iconPath = {
        light: path.join(rootPath!, "icon.svg"),
        dark: path.join(rootPath!, "logo.svg")
    };
}

function command(command: any, _: any, arg2: (_: any) => Tool): Tool[] | PromiseLike<Tool[]> {
    throw new Error('Function not implemented.');
}


function _(command: any, _: any, arg2: (_: any) => Tool): Tool[] | PromiseLike<Tool[]> {
    throw new Error('Function not implemented.');
}
