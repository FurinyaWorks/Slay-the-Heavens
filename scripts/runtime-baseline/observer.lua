local nativeMethods={}
for _,name in ipairs({'SetVisible','SetSizeDelta','SetLocalScale','SetAnchoredPosition','SetImage','SetAnchorMin','SetAnchorMax','SetPivot','SetLocalRotation','SetAsLastSibling','AddCursorEventListener','AddKeyEventListener','AddNavigationEventListener','SetControllerNavigation','RefreshItems'})do nativeMethods[name]=true end
-- Mirror the existing Host trace interception so repeated direct writes count.
return function(control,counts,lookups)
 counts.methods=counts.methods or {};counts.properties=counts.properties or {}
 local original=getmetatable(control);local fields,wrappers={},{}
 for k,v in pairs(control)do fields[k]=v end
 for k in pairs(fields)do rawset(control,k,nil)end
 setmetatable(control,{
  __pairs=function()return next,fields,nil end,
  __index=function(_,key)
   assert(key~='interactable' or fields.kind~='cursorArea','Native CursorArea has no interactable field')
   local value=fields[key]
   if value==nil then value=original.__index(control,key)end
   local lookup=lookups and (key=='GetChild' or key=='GetChildren')
   if type(value)~='function' or not (nativeMethods[key] or lookup or lookups and key=='SetActive') then return value end
   if not wrappers[key]then wrappers[key]=function(...)
    counts.nativeCalls=counts.nativeCalls+1;counts.methods[key]=(counts.methods[key] or 0)+1
    if lookup and fields.name=='mapPanel' and key=='GetChild' then
     local name=select(2,...)
     if type(name)=='string' and name:match('^mapGroup%d+$') then
      counts.mapGroupLookups=(counts.mapGroupLookups or 0)+1
     end
    end
    return value(...)
   end end
   return wrappers[key]
  end,
  __newindex=function(_,key,value)
   assert(key~='interactable' or fields.kind~='cursorArea','Native CursorArea has no interactable field')
   assert(key~='alive' and key~='activeInHierarchy','read-only native property')
   counts.propertyWrites=counts.propertyWrites+1;counts.properties[key]=(counts.properties[key] or 0)+1;fields[key]=value;wrappers[key]=nil
  end})
end
