import { PerisitenceService } from './../../services/persistence/perisitence.service';
import { WorkflowDetailsService } from './../../services/workflow-details/workflow-details.service';

import { Router } from '@angular/router';
import { AuthenticationService } from './../../services/authentication/authentication.service';
 import {Component, OnInit, Inject,ViewEncapsulation,ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormControl } from '@angular/forms';
import * as shape from 'd3-shape';
import { colorSets } from './models/color-sets';
import { countries, generateHierarchialGraph, getTurbineData } from './models/data';
import chartGroups from './models/chartTypes';
import { id } from './models/id';
import {Task} from "./models/task";
import {Workflow} from "./models/workflow";
import { FormBuilder, FormGroup } from '@angular/forms';
import {MatChipInputEvent} from '@angular/material';
import 'rxjs/add/operator/filter'; 
import 'rxjs/add/operator/map';
import { TagInputModule } from 'ngx-chips';
import 'rxjs/add/operator/debounceTime';
import {MatRadioModule} from '@angular/material/radio';
import { JsonEditorComponent, JsonEditorOptions } from 'angular4-jsoneditor/jsoneditor/jsoneditor.component';
import { TSMap } from "typescript-map";
import { OnDestroy } from '@angular/core';
/**
 * @title Dialog Overview
 */ 
@Component({
  selector: 'app-create-workflow',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './create-workflow.component.html',
  styleUrls: ['./create-workflow.component.css']
})
export class CreateWorkflowComponent implements OnInit, OnDestroy{
  //Task Library 
  public tasks: Array<String> = ["git-clone","mvn-package"];
  //Tasks of the workflow
  map = new TSMap<String,Task>();
  //Dummy workflow
  workflow :Workflow = {};
  task :Task ={};
  //wORKFLOW Name
  Wname  :String;
  taskName :String;
  taskType : String;
  dependsOn : any;
  depends_on : any;
  input :String;
  //workFlow Status
  status = "created"; 
  //List of all aliases in a workflow                          
  wTaskAliases : String[] = [];
  //DEletion Mode
  deleteMode : boolean = false;
  deleteModeButton ="DELETE TASKS";


  //Chart properties
  version = "APP_VERSION";
  theme = 'dark';
  chartType = 'directed-graph';
  chartGroups: any;
  chart: any;
  realTimeData: boolean = false;
  countries: any[];
  graph: { links: any[], nodes: any[] };
  hierarchialGraph: { links: any[], nodes: any[] };

  view: any[];
  width: number = 700;
  height: number = 300;
  fitContainer: boolean = true;
  autoZoom: boolean = true;

  // options
  showLegend = false;
  orientation: string = 'LR'; // LR, RL, TB, BT

  orientations: any[] = [
    {
      label: 'Left to Right',
      value: 'LR'
    }, {
      label: 'Right to Left',
      value: 'RL'
    }, {
      label: 'Top to Bottom',
      value: 'TB'
    }, {
      label: 'Bottom to Top',
      value: 'BT'
    }
  ];

  // line interpolation
  curveType: string = 'Step';
  curve: any = shape.curveLinear;
  interpolationTypes = [
    'Bundle', 'Cardinal', 'Catmull Rom', 'Linear', 'Monotone X',
    'Monotone Y', 'Natural', 'Step', 'Step After', 'Step Before'
  ];
  
  //Colorset options
  colorSets:any;
  colorSets1 =["vivid","natural","cool",'fire','solar','air','aqua','flame','ocean','forest','horizon','neons','picnic','night','nightLights'];
  colorScheme: any;
  schemeType: string = 'ordinal';
  selectedColorScheme: string;

  constructor(
    public dialog: MatDialog, 
    private authentication : AuthenticationService,
    private persistence: PerisitenceService,
    private router: Router,
    private workflowService: WorkflowDetailsService
  ) {

    Object.assign(this, {
      countries,
      colorSets,
      chartGroups,
      hierarchialGraph: getTurbineData(),
    });
   
    this.setColorScheme('picnic');
    this.setInterpolationType('Bundle');
  }

  //Display a worflow if user comes to view 
  ngOnInit() { 
       
      
    this.selectChart(this.chartType);
    this.selectedColorScheme = "aqua"; 
    
    if (!this.fitContainer) {
      this.applyDimensions();
    }
    if (this.workflowService.displayWorkflow!=null){
      console.log(this.workflowService.displayWorkflow.tasks);
          this.map.fromJSON( this.workflowService.displayWorkflow.tasks);
          this.wTaskAliases = this.map.keys();
          this.workflowToGraph(this.map);
      console.log(this.map);    
    }
    else{
      this.openWnameDialog();
    }
  }

//DEstroy the workflow that the user viewed
  ngOnDestroy() {
    this.workflowService.displayWorkflow=null;
  }


//Update nodes to add a node to workflow  
updateNodes(taskname:String) {

    const hNode = {
        id:id(),
        label: taskname,
      };

      this.hierarchialGraph.nodes.push(hNode);
      this.hierarchialGraph.links = [...this.hierarchialGraph.links];
      this.hierarchialGraph.nodes = [...this.hierarchialGraph.nodes];
    }
  //update links when add a node
  updateLinks(depends :String[],taskname :String){


      let target :any;

      let len = depends.length;
      let len2 =  this.hierarchialGraph.nodes.length;

      for(let i=0;i<len2;i++){

          if(this.hierarchialGraph.nodes[i].label==taskname)
          {

            target = this.hierarchialGraph.nodes[i].id;
          }

      }



     for(let i=0;i<len2;i++){

          for(let j=0;j<len;j++){

            if(this.hierarchialGraph.nodes[i].label==depends[j])
                {
                  this.hierarchialGraph.links.push({
                   source: this.hierarchialGraph.nodes[i].id,
                   target: target,
                   label: 'on success'

      });
                  console.log("ggghjhjhjkkk");
        }
       }

       }

      this.hierarchialGraph.links = [...this.hierarchialGraph.links];
      this.hierarchialGraph.nodes = [...this.hierarchialGraph.nodes];


  }

  applyDimensions() {
    this.view = [this.width, this.height];
  }

  toggleFitContainer(fitContainer: boolean, autoZoom: boolean): void {
    this.fitContainer = fitContainer;
    this.autoZoom = autoZoom;

    if (this.fitContainer) {
      this.view = undefined;
    } else {
      this.applyDimensions();
    }
  }

  selectChart(chartSelector) {
    this.chartType = chartSelector;

    for (const group of this.chartGroups) {
      for (const chart of group.charts) {
        if (chart.selector === chartSelector) {
          this.chart = chart;
          return;
        }
      }
    }
  }
  
  //Enter or exit deletion mode
  deletemode(){
    if(!this.deleteMode){
        this.deleteMode = true;
    alert("You are in deletion mode.Click on the nodes to delete them");
     this.deleteModeButton = "EXIT MODE";
  }

    else{
          this.deleteMode = false;
    alert("You are out of deletion mode");
           this.deleteModeButton = "DELETE TASKS";
           }
  }
//On select a node to delete
  select(data) {
    console.log('Item clicked', data);
    if(this.deleteMode){
      this.deleteTask(data.label);

    }
  }
//Delete a task and it's links
  deleteTask(label:String){
       console.log(label)
       console.log(this.map);
      this.map.delete(label);
      this.wTaskAliases = this.wTaskAliases.filter(item => item != label);
      console.log(this.map);
      this.map.forEach((value: Task, key: String) => {
    value.depends_on = value.depends_on.filter(item => item != label);
    value.input =  value.input.filter(item => item != label);
           });
      this.workflow.tasks = this.map;
      this.workflowToGraph(this.map);

  }
//Convert any map to links
workflowToGraph(map :TSMap<String,Task> ){

this.hierarchialGraph = getTurbineData();
let len =  this.wTaskAliases.length;

for(let i=0;i<len;i++){


      this.updateNodes(this.wTaskAliases[i]);
      
      if(map.get(this.wTaskAliases[i]).depends_on!=null){
      this.updateLinks(map.get(this.wTaskAliases[i]).depends_on,this.wTaskAliases[i]);
      console.log(map.get(this.wTaskAliases[i]).depends_on,this.wTaskAliases[i]);}

}


}

//To set a color scheme
  setColorScheme(name) {
    this.selectedColorScheme = name;
    this.colorScheme = this.colorSets.find(s => s.name === name);
  }

// To SET A CURVE TYPE
  setInterpolationType(curveType) {
    this.curveType = curveType;
    if (curveType === 'Bundle') {
      this.curve = shape.curveBundle.beta(1);
    }
    if (curveType === 'Cardinal') {
      this.curve = shape.curveCardinal;
    }
    if (curveType === 'Catmull Rom') {
      this.curve = shape.curveCatmullRom;
    }
    if (curveType === 'Linear') {
      this.curve = shape.curveLinear;
    }
    if (curveType === 'Monotone X') {
      this.curve = shape.curveMonotoneX;
    }
    if (curveType === 'Monotone Y') {
      this.curve = shape.curveMonotoneY;
    }
    if (curveType === 'Natural') {
      this.curve = shape.curveNatural;
    }
    if (curveType === 'Step') {
      this.curve = shape.curveStep;
    }
    if (curveType === 'Step After') {
      this.curve = shape.curveStepAfter;
    }
    if (curveType === 'Step Before') {
      this.curve = shape.curveStepBefore;
    }
  }

  onLegendLabelClick(entry) {
    console.log('Legend clicked', entry);
  }

  toggleExpand(node) {
    console.log('toggle expand', node);
  }

  //Dialog to add a task
  openDialog(): void {
    let dialogRef = this.dialog.open(DialogOverviewDialog, {
      width: '500px',
      data: { taskName: this.taskName, taskType:this.taskType ,dependsOn:this.dependsOn,input:this.input,taskAliases:this.wTaskAliases,taskTypes:this.tasks}
    });

    dialogRef.afterClosed().subscribe(result => {
      
      let task : Task ={};
      this.taskName = result.taskName;
      task.taskType = result.taskType;
      this.depends_on = result.dependsOn;
      task.input = [];
       task.input.push(result.input);
      this.wTaskAliases.push(result.taskName);
      
      task.depends_on =[];
     
      this.updateNodes(this.taskName);

      if(this.depends_on!=undefined){
        
       let len2 = this.depends_on.length;
       for(let i=0;i<len2;i++){
         if(JSON.parse(JSON.stringify(result.dependsOn[i])).value!=null)
        {
        task.depends_on.push(JSON.parse(JSON.stringify(result.dependsOn[i])).value);}
         else 
        {
          task.depends_on.push(JSON.stringify(result.dependsOn[i]).replace(/\"/g,''));}
         }
        
        this.updateLinks(task.depends_on,this.taskName);
         
      }

      
      console.log(this.taskName)
      this.map.set(this.taskName,task);
      this.workflow.tasks = this.map;
      console.log(this.map);
       });
  }

//Save workflow to DB
  saveWorkflow(): void {
      
      //owner is hardcoded
      this.workflow.owner = "chutiya";
      this.persistence.sendWorkFlow2(this.workflow.workFlowName,
                                      this.workflow.owner,this.status,this.map);
                                      console.log(this.map);    
    }

// Dialog for the workflow name
    openWnameDialog(): void {
    let dialogRef = this.dialog.open(WnameOverviewDialog, {
      width: '300px',
      data: { Wname: this.Wname }
    });

    dialogRef.afterClosed().subscribe(result => {
      
      this.workflow.workFlowName=result;
      console.log(this.workflow.workFlowName,'The dialog was closed');
      
      
    });
  }

  //Dialog for jsoneditor
  openjsoneditor(): void {
    let json =this.map.toJSON();
    let dialogRef = this.dialog.open(JsonEditor, {
     data: { json: json },
     width: '700px',
     height: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      let myMap = new TSMap<String,Task>();
       myMap.fromJSON(result);
       console.log(myMap);
       this.map=myMap;
       
       this.wTaskAliases =this.map.keys();
       
       this.workflowToGraph(this.map);

      
    });
  }

  //Dialog for settings of the graph
  openSettings(): void {
   
    let dialogRef = this.dialog.open(SettingsDialog, {
     data: { orientations: this.orientations,orientation :this.orientation ,colors:this.colorSets1,color:this.selectedColorScheme,curveTypes : this.interpolationTypes,curveType :this.curveType},
     width: '300px',
    });

    dialogRef.afterClosed().subscribe(result => {
       
                this.orientation = result.orientation;
                this.setColorScheme(result.color);
                this.setInterpolationType(result.curveType);
    });
  }

 

}

@Component({
  selector: 'dialog-overview-dialog',
  templateUrl: 'dialog-overview-dialog.html',
  styleUrls : ['dialog-overview-dialog.css']
})
export class DialogOverviewDialog {
  
  
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { } 

    
  onNoClick(): void { 

   if (this.data.taskName == null||this.data.taskType == null)
       alert("Please give task name and type");

   if (this.data.taskName != null&&this.data.taskType != null)  
    this.dialogRef.close(this.data);
  }
 onCancelClick(): void{
    this.dialogRef.close();

 }
}


@Component({
  selector: 'wname-overview-dialog',
  templateUrl: 'wname-overview-dialog.html',
  styleUrls : ['wname-overview-dialog.css']
})
export class WnameOverviewDialog {
  
  constructor(
    public dialogRef: MatDialogRef<WnameOverviewDialog >,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
   
  onNoClick(): void { 

    if (this.data.Wname == null)
       alert("Please give a name to the workflow");
    if (this.data.Wname != null)
      this.dialogRef.close(this.data.Wname);
  }
  


}

@Component({
  selector: 'jsoneditor-overview-dialog',
  templateUrl: 'jsoneditor-overview-dialog.html',
  styleUrls : ['jsoneditor-overview-dialog.css']
})
export class JsonEditor {
  
  public editorOptions: JsonEditorOptions;
  public jsondata: any;
  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;
  constructor(
    public dialogRef: MatDialogRef<JsonEditor >,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.editorOptions = new JsonEditorOptions()
    this.editorOptions.modes = ['code', 'text', 'tree', 'view']; 
    this.jsondata = {"products":[{"name":"car","product":[{"name":"honda","model":[{"id":"civic","name":"civic"},{"id":"accord","name":"accord"},{"id":"crv","name":"crv"},{"id":"pilot","name":"pilot"},{"id":"odyssey","name":"odyssey"}]}]}]};
 
   
  }

  onNoClick(): void { 

      console.log(this.editor.get())
      this.dialogRef.close(this.editor.get());
  }
  


}
@Component({
  selector: 'settings-overview-dialog',
  templateUrl: 'settings-overview-dialog.html',
  styleUrls : ['settings-overview-dialog.css']
})
export class SettingsDialog {
  
  
  
  constructor(
    public dialogRef: MatDialogRef<SettingsDialog >,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void { 

      
      this.dialogRef.close(this.data);
  }
  


}