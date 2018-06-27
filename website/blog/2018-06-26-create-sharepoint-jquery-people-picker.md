---
author: Brent Ely
authorURL: https://github.com/gitbrent/
title: Creating SharePoint jQuery People-Picker with SpRestLib
---

Create a fully-functional jQuery People Picker against your local SharePoint ActiveDirectory structure using only
jQuery and SpRestLib.

<!--truncate-->

*****************************

## Example

Find every HTML element with the `pickSPUser` class and initialize it as an SpRestLib-Picker

Libraries:
```html
<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<script src="https://cdn.rawgit.com/gitbrent/SpRestLib/v1.7.0/dist/sprestlib.bundle.js"></script>
```

JavaScript:
```javascript
$('.pickSPUser').each(function(){
	$(this)
	.prop('placeholder', 'Enter Last, First...')
	.autocomplete({
		minLength: 3,
		source: function doRestQuery(request,response){
			sprLib.rest({
				url : '_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.clientPeoplePickerSearchUser',
				type: 'POST',
				data: JSON.stringify({
					'queryParams':{
						'__metadata':{ 'type':'SP.UI.ApplicationPages.ClientPeoplePickerQueryParameters' },
						'AllowEmailAddresses':true, 'AllowMultipleEntities':false, 'AllUrlZones':false,
						'MaximumEntitySuggestions':20, 'PrincipalSource':15, 'PrincipalType':1,
						'QueryString':request.term
					}
				})
			})
			.then(function(arrData){
				if ( arrData && arrData.length > 0 ) {
					var results = JSON.parse(arrData[0].ClientPeoplePickerSearchUser);
					if ( results.length > 0 ) {
						response( $.map(results,function(item){ return {label:item.DisplayText, value:item.EntityData.SIPAddress} }) );
					}
				}
			})
			.catch(function(strErr){ console.error(strErr); })
		},
		select: function(event,ui){
			var elePickerId = $($(this).context).prop('id');
			sprLib.user({ email:ui.item.value }).info().then(function(objUser){ $('#'+elePickerId).val(objUser.Id) });

			// Hide input with selected Person value / Create/Show PP-UI
			$(event.target).hide().after(
				'<div id="PP'+ elePickerId +'" class="pt-pickSPUser ui-state-default ui-corner-all addHoverEffectDone">'
				+ '  <div class="table">'
				+ '    <div class="pt-pickSPUser-person-cntr"><span>'+ui.item.label+'</span></div>'
				+ '    <div style="padding-left:10px">'
				+ '      <a href="javascript:" onclick="$(\'#'+elePickerId+'\').show().text(\'\').val(\'\'); $(\'#PP'+elePickerId+'\').remove();">'
				+ '      <img alt="Delete" src="../SiteAssets/img/delete_16.png" alt="Remove" title="Remove" style="vertical-align:middle"></a>'
				+ '    </div>'
				+ '  </div>'
				+ '</div>'
			);
		}
	});
});
```

### Result
![jQuery SharePoint People Picker](https://raw.githubusercontent.com/gitbrent/SpRestLib/master/example/img/demo-sharepoint-jquery-people-picker-1.png)
![jQuery SharePoint People Picker](https://raw.githubusercontent.com/gitbrent/SpRestLib/master/example/img/demo-sharepoint-jquery-people-picker-2.png)

## Code Sample
See [`examples/sprestlib-demo-people-picker.html`](https://github.com/gitbrent/SpRestLib/tree/master/example) for a working demo.
