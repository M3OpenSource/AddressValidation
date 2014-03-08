import System;
import System.Windows;
import System.Windows.Automation.Peers;
import System.Windows.Automation.Provider;
import System.Windows.Controls;
import System.Windows.Input;
import System.Windows.Media;
import System.Windows.Threading;
import System.Xml;
import Mango.Core.Util;
import Mango.Services;
import Mango.UI;
import Mango.UI.Core;
import Mango.UI.Services.Mashup;
import Mango.UI.Services;
import MForms;

/*
	Address Validation for M3
	https://github.com/M3OpenSource/AddressValidation

	Simple address verification for Infor M3 using the Google Geocoding API for the following M3 Panels in Infor Smart Office:
		- Customer. Open - CRS610/E
		- Customer. Connect Addresses - OIS002/E
		- Supplier. Connect Address - CRS622/E
		- Customer Order. Connect Address - OIS102/E
		- Internal Address. Open - CRS235/E1
		- Company. Connect Division - MNS100/E
		- Ship-Via Address. Open - CRS300/E
		- Service Order. Connect Delivery Address - SOS005/E
		- Shop. Open - OPS500/I
		- Bank. Open - CRS690/E
		- Bank. Connect Bank Branch Office - CRS691/E
		- Equipment Address. Open - MOS272/E

	VERSION HISTORY:
	2014-03-07: Thibaud Lopez Schneider: First open source release

	INSTALLATION:
	1) Set the address layout in the Mashup XAML depending on your country (United States, France, Sweden, etc.)
	2) Set the address layout in this script depending on your country
	3) Install the Mashup:
		- Either install the Mashup privately with Mashup Designer:
			- In Smart Office, start the Mashup Designer with designer://mashup
			- Select File > Open > Project
			- Browse to AddressValidation.manifest
			- Select Deploy > Private
			- Close Mashup Designer
		- Either install the Mashup globally with LifeCycle Manager
	4) Install this script:
		- Either test this script with the Script Tool:
			- In Smart Office, go to any of the supported M3 Panels, for example CRS610/E
			- Start the Script Tool with mforms://jscript
			- Select File > Open
			- Browse to this Script file
			- Select the M3 Panel Instance, for example CRS610/E
			- Select Script > Compile
			- Select Script > Run
		- Either attach this script privately:
			- Drop this file in the Smart Office Scripts folder in your LifeCycle Manager server, for example \\<HOST>\E$\Infor\LifeCycleManager\Service\<SERVICE>\grid\<M3>\applications\M3_UI_Adapter\webapps\mne\jscript\
			- In Smart Office, go to any of the supported M3 Panels, for example CRS610/E
			- Select Tools > Personalize > Scripts
			- Enter Script AddressValidation_V1
			- Leave Argument blank
			- Click Add
			- Click Save
			- Press F5-Refresh to load the script
		- Either attach this script for other Users, Roles, or Globally:
			- Drop this file in the Smart Office Scripts folder in your LifeCycle Manager server, for example \\<HOST>\E$\Infor\LifeCycleManager\Service\<SERVICE>\grid\<M3>\applications\M3_UI_Adapter\webapps\mne\jscript\
			- In the Navigator widget in Smart Office, select Administration tools > Personalization Manager
			- Enter the path to the Customizations folder of your Smart Office server, for example \\<HOST>\d$\Infor\MNE_Data\Customizations\
			- Select the combination of Script and User/Role/Global
	5) Become a contributor to this open source project at https://github.com/M3OpenSource/AddressValidation

	OPTIONAL:
	- Get a Google Geocoding API Key, and set it as a parameter of the REST.BaseAddress in the Mashup DataListPanel; refer to: https://developers.google.com/maps/documentation/geocoding/#api_key

	DOCUMENTATION:
	- The Google Geocoding API, https://developers.google.com/maps/documentation/geocoding/
	- Infor Smart Office Developer's Guide
	- Infor Smart Office Administration Guide	
	- Infor Mashup Designer User Guide

	VIDEO TUTORIALS:
	- Deploy Mashup Locally: http://youtu.be/FN_6oYiUS4E
	- Test Script: http://youtu.be/K9Ul35RzUEQ
	- Examples: http://youtu.be/U6S-BQXW80c

	PENDING:
	- Add more address providers, UPS, USPS, QAS, etc.
	- Set focus to the first row in the list
	- Handle the ESC key to close the Mashup
	- Test this script in all versions of Smart Office, currently tested only on Smart Office 10.1.1.1.5
*/
package MForms.JScript {
	class AddressValidation_V1 {

		/*
			Constants
		*/
		const WEBDINGS_GLOBE_EURAFRICA:   Char = 0xFC;
		const WEBDINGS_GLOBE_AUSTRALASIA: Char = 0xFD;
		const WEBDINGS_GLOBE_AMERICAS:    Char = 0xFE;

		/*
			M3 meta-data
		*/
		const Metadata = {
			"CRS610/E": {
				/* Customer. Open - CRS610/E */
				FirmName: "WRCUNM",
				AddressLine1: "WRCUA1",
				AddressLine2: "WRCUA2",
				AddressLine3: "WRCUA3",
				AddressLine4: "WRCUA4",
				City: "WRTOWN",
				State: "WRECAR",
				PostalCode: "WRPONO",
				Country: "WRCSCD",
				SnapButtonTo: "WRCUA1"
			},
			"OIS002/E": {
				/* Customer. Connect Addresses - OIS002/E */
				FirmName: "WRCUNM",
				AddressLine1: "WRCUA1",
				AddressLine2: "WRCUA2",
				AddressLine3: "WRCUA3",
				AddressLine4: "WRCUA4",
				City: "WRTOWN",
				State: "WRECAR",
				PostalCode: "WRPONO",
				Country: "WRCSCD",
				SnapButtonTo: "WRCUA1"
			},
			"CRS622/E": {
				/* Supplier. Connect Address - CRS622/E */
				FirmName: "WWSUNM",
				AddressLine1: "WWADR1",
				AddressLine2: "WWADR2",
				AddressLine3: "WWADR3",
				AddressLine4: "WWADR4",
				City: "WWTOWN",
				State: "WWECAR",
				PostalCode: "WWPONO",
				Country: "WWCSCD",
				SnapButtonTo: "WWADR1"
			},
			"OIS102/E": {
				/* Customer Order. Connect Address - OIS102/E */
				FirmName: "WRCUNM",
				AddressLine1: "WRCUA1",
				AddressLine2: "WRCUA2",
				AddressLine3: "WRCUA3",
				AddressLine4: "WRCUA4",
				City: "WRTOWN",
				State: "WRECAR",
				PostalCode: "WRPONO",
				Country: "WRCSCD",
				SnapButtonTo: "WAD12CF"
			},
			"CRS235/E1": {
				/* Internal Address. Open - CRS235/E1 */
				FirmName: "WWCONM",
				AddressLine1: "WWADR1",
				AddressLine2: "WWADR2",
				AddressLine3: "WWADR3",
				AddressLine4: "WWADR4",
				City: "WWTOWN",
				State: "WWECAR",
				PostalCode: "WWPONO",
				Country: "WWCSCD",
				SnapButtonTo: "WWADR1"
			},
			"MNS100/E": {
				/* Company. Connect Division - MNS100/E */
				FirmName: "WWCONM",
				AddressLine1: "WWCOA1",
				AddressLine2: "WWCOA2",
				AddressLine3: "WWCOA3",
				AddressLine4: "WWCOA4",
				City: "WWTOWN",
				State: "WWECAR",
				PostalCode: "WWPONO",
				Country: "WWCSCD",
				SnapButtonTo: "WWCOA1"
			},
			"CRS300/E": {
				/* Ship-Via Address. Open - CRS300/E */
				FirmName: "WWCONM",
				AddressLine1: "WWADR1",
				AddressLine2: "WWADR2",
				AddressLine3: "WWADR3",
				AddressLine4: "WWADR4",
				City: "WWTOWN",
				State: "WWECAR",
				PostalCode: "WWPONO",
				Country: "WWCSCD",
				SnapButtonTo: "WWADR1"
			},
			"SOS005/E": {
				/* Service Order. Connect Delivery Address - SOS005/E - PENDING: to be tested in LSC */
				FirmName: "WPCONM",
				AddressLine1: "WPADR1",
				AddressLine2: "WPADR2",
				AddressLine3: "WPADR3",
				AddressLine4: "WPADR4",
				City: "WPTOWN",
				State: "WPECAR",
				PostalCode: "WPPONO",
				Country: "WPCSCD",
				SnapButtonTo: "WPADR1"
			},
			"OPS500/I": {
				/* Shop. Open - OPS500/I - PENDING: to be tested in LSC */
				FirmName: "LBL_L21T2", /*PENDING*/
				AddressLine1: "WICUA1",
				AddressLine2: "WICUA2",
				AddressLine3: "",
				AddressLine4: "",
				City: "WICUA3",
				State: "",
				PostalCode: "",
				Country: "WICUA4",
				SnapButtonTo: "WICUA1"
			},
			"CRS690/E": {
				/* Bank. Open - CRS690/E */
				FirmName: "WEBKNM",
				AddressLine1: "WEBKA1",
				AddressLine2: "WEBKA2",
				AddressLine3: "WEBKA3",
				AddressLine4: "WEBKA4",
				City: "WETOWN",
				State: "WEECAR",
				PostalCode: "WEPONO",
				Country: "WECSCD",
				SnapButtonTo: "WEBKA1"
			},
			"CRS691/E": {
				/* Bank. Connect Bank Branch Office - CRS691/E */
				FirmName: "WEBKBM",
				AddressLine1: "WEBKA1",
				AddressLine2: "WEBKA2",
				AddressLine3: "WEBKA3",
				AddressLine4: "WEBKA4",
				City: "WEBKA2", /* Note: CRS691/E doesn't have a City field so I use Address Line 2 */
				State: "WEECAR",
				PostalCode: "WEPONO",
				Country: "WECSCD",
				SnapButtonTo: "WEBKA1"
			},
			"MOS272/E": {
				/* Equipment Address. Open - MOS272/E */
				FirmName: "WRCUNM",
				AddressLine1: "WRCUA1",
				AddressLine2: "WRCUA2",
				AddressLine3: "WRCUA3",
				AddressLine4: "WRCUA4",
				City: "WRTOWN",
				State: "WRECAR",
				PostalCode: "WRPONO",
				Country: "WRCSCD",
				SnapButtonTo: "WRCUA1" /* PENDING: find the Label ID */
			}
		};

		/*
			Global variables
		*/
		var debug;
		var controller;
		var content;
		var AddressFields: Object = {}; // the controls of the address fields
		var btnValidate; // 'Validate' button
		var runner: Runner; // Mashup runner
		var dataGrid: DataGrid; // Mashup's list of results

		/*
			Main entry point
		*/
		public function Init(element: Object, args: Object, controller: Object, debug: Object) {
			try {
				// save global variables
				this.debug = debug;
				this.controller = controller;
				this.content = controller.RenderEngine.Content;
				// check pre-conditions
				PreConditions();
				// start when the UI is ready
				var StartDelegate: VoidDelegate = InitializeComponent;
				content.Dispatcher.BeginInvoke(DispatcherPriority.Background, StartDelegate);
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}

		/*
			Check the pre-conditions prior to executing the script.
		*/
		function PreConditions() {
			// ensure we're in a supported M3 Panel
			var panel: String = controller.RenderEngine.PanelHeader;
			if (Metadata[panel] == null) {
				throw new Exception("This M3 Panel is not supported.");
			}
			// ensure we find the address fields
			var fields: Object = Metadata[panel];
			for (var key: String in fields) {
				var fieldName: String = fields[key];
				if (fieldName != "") {
					var control: Control = ScriptUtil.FindChild(content, fieldName);
					if (control == null) {
						throw new Exception("Could not find field " + fieldName + ".");
					} else {
						// save a reference to this field
						AddressFields[key] = control;
					}
				}
			}
		}

		/*
			Draw the user interface
		*/
		function InitializeComponent() {
			try {
				// snap the 'Validate' button next to this
				var SnapButtonTo = AddressFields["SnapButtonTo"];
				// create a TextBlock for the 'Validate' button as a little Webdings icon that looks like a globe
				var textBlock = new TextBlock();
				textBlock.FontFamily = new FontFamily("Webdings");
				textBlock.FontSize = Configuration.CellHeight;
				textBlock.Text = WEBDINGS_GLOBE_AMERICAS;
				textBlock.ToolTip = "Validate this address";
				// create the 'Validate' button
				btnValidate = new Button();
				btnValidate.Content = textBlock;
				btnValidate.BorderThickness = new Thickness(0);
				btnValidate.TabIndex = SnapButtonTo.TabIndex + 1;
				btnValidate.Width = Double.NaN; // Auto;
				btnValidate.Height = Double.NaN; // Auto
				// position the button
				var row: int = Grid.GetRow(SnapButtonTo);
				var column: int = Grid.GetColumn(SnapButtonTo) + Grid.GetColumnSpan(SnapButtonTo);
				Grid.SetRow(btnValidate, row);
				Grid.SetColumn(btnValidate, column);
				Grid.SetRowSpan(btnValidate, 1);
				Grid.SetColumnSpan(btnValidate, 3);
				content.Children.Add(btnValidate);
				// register the event handlers
				btnValidate.add_GotFocus(OnGotFocus);
				btnValidate.add_LostFocus(OnLostFocus);				
				btnValidate.add_MouseEnter(OnMouseEnter);
				btnValidate.add_MouseLeave(OnMouseLeave);
				btnValidate.add_Click(OnBtnValidate);
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}
		function OnGotFocus(sender: Object, e: RoutedEventArgs) {
			btnValidate.Content.Text = WEBDINGS_GLOBE_AUSTRALASIA;
		}
		function OnLostFocus(sender: Object, e: RoutedEventArgs) {
			btnValidate.Content.Text = WEBDINGS_GLOBE_AMERICAS;
		}
		function OnMouseEnter(sender: Object, e: MouseEventArgs) {
			btnValidate.Content.Text = WEBDINGS_GLOBE_EURAFRICA;
		}
		function OnMouseLeave(sender: Object, e: MouseEventArgs) {
			btnValidate.Content.Text = WEBDINGS_GLOBE_AMERICAS;
		}

		/*
			Handles the click event on the 'Validate' button.
		*/
		function OnBtnValidate(sender: Object, e: RoutedEventArgs) {
			try {
				// start the Mashup
				var uri: String = "mashup:///?BaseUri=AddressValidation.mashup&RelativeUri=AddressValidation.xaml";
				var task: Task = new Task(uri);
				var handler: RunnerStatusChangedEventHandler = OnMashupStatusChanged;
				DashboardTaskService.Current.LaunchTaskModal(task, null, handler);
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}

		/*
			Handles events on the Mashup.
		*/
		function OnMashupStatusChanged(sender: Object, e: RunnerStatusChangedEventArgs) {
			try {
				if (e.NewStatus == RunnerStatus.Running) {
					// the Mashup is starting
					runner = e.Runner;
					var mashupContent: MashupInstance = runner.Host.HostContent;
					// get the address in a single line, for the Google Geocoding API
					var address: String = "";
					for (var key in AddressFields) {
						if (key != "SnapButtonTo") {
							var control = AddressFields[key];
							var value: String = MFormsUtil.GetControlValue(control).Trim();
							if (value != "") {
								if (address == "") {
									address += value;
								} else {
									address += ", " + value;
								}
							}
						}
					}
					debug.WriteLine(address);
					// set the address
					var txtAddress: TextBox = mashupContent.FindName("txtAddress");
					txtAddress.Text = address;
					// click the button
					var btnSearch: Button = mashupContent.FindName("btnSearch");
					var peer: ButtonAutomationPeer = new ButtonAutomationPeer(btnSearch);
					var invokeProv: IInvokeProvider = peer.GetPattern(PatternInterface.Invoke);
					invokeProv.Invoke();
					// wait for the user to select an address
					var AddressList: DataListPanel = mashupContent.FindName("AddressList");
					dataGrid = AddressList.ListControl;
					dataGrid.add_PreviewKeyDown(OnPreviewKeyDown);
					dataGrid.add_MouseDoubleClick(OnMouseDoubleClick);
					var btnSelect: Button = mashupContent.FindName("btnSelect");
					btnSelect.add_Click(OnSelect);
				} else if (e.NewStatus == RunnerStatus.Closed) {
					// the Mashup is closing
				}
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}
		
		/*
			Handles Key Down events in the Data Grid.
		*/
		function OnPreviewKeyDown(sender: Object, e: KeyEventArgs) {
			try {
				if (e.Key == Key.Enter) {
					SelectRow();
					DashboardTaskService.Current.CloseTask(runner);
					e.Handled = true;
				} else if (e.Key == Key.Escape) {
					DashboardTaskService.Current.CloseTask(runner);
					e.Handled = true;
				}
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}
		
		/*
			Handles Mouse Double-click events in the Data Grid.
		*/
		function OnMouseDoubleClick(sender: Object, e: MouseButtonEventArgs) {
			try {
				SelectRow();
				DashboardTaskService.Current.CloseTask(runner);
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}

		/*
			Handles Click events for the button 'Select'.
		*/
		function OnSelect(sender: Object, e: RoutedEventArgs) {
			try {
				SelectRow();
				DashboardTaskService.Current.CloseTask(runner);
			} catch (ex: Exception) {
				ConfirmDialog.ShowErrorDialog("Script", ex);
			}
		}
		
		/*
			Selects the current row.
			PENDING: change the address layout based on your country
		*/
		function SelectRow() {
			if (dataGrid.SelectedIndex == -1) {
				// if no rows selected then leave and let the pop-up close
				return;
			}
			// get Google Geocoding API XML result
			var nodeList: XmlElement = dataGrid.Items[dataGrid.SelectedIndex]; if (nodeList == null) return;
			// get the values from the columns
			var node: XmlElement;
			// Address Line 1
			node = nodeList.SelectSingleNode("address_component[type='street_number']/short_name"); if (node) AddressFields["AddressLine1"].Text  =        node.InnerText;
			node = nodeList.SelectSingleNode("address_component[type='route']/short_name");	        if (node) AddressFields["AddressLine1"].Text +=  " " + node.InnerText;
			node = nodeList.SelectSingleNode("address_component[type='subpremise']/short_name");	if (node) AddressFields["AddressLine1"].Text += " #" + node.InnerText;
			// Address Line 2
			AddressFields["AddressLine2"].Text = "";
			// Address Line 3
			AddressFields["AddressLine3"].Text = "";
			// Address Line 4
			AddressFields["AddressLine4"].Text = "";
			// city
			node = nodeList.SelectSingleNode("address_component[type='locality']/long_name"); if (node) AddressFields["City"].Text = node.InnerText;
			// state
			node = nodeList.SelectSingleNode("address_component[type='administrative_area_level_1']/short_name"); if (node) AddressFields["State"].Text = node.InnerText;
			// postal code
			node = nodeList.SelectSingleNode("address_component[type='postal_code']/short_name"); if (node) AddressFields["PostalCode"].Text = node.InnerText;
			// country
			node = nodeList.SelectSingleNode("address_component[type='country']/short_name"); if (node) AddressFields["Country"].Text = node.InnerText;
		}
	}
}

