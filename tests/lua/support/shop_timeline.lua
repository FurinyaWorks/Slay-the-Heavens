-- Drive the bounded shelf preparation and its animation as individual frames.
return function(ui)
    for _ = 1, 18 do ui:update(1 / 30) end
end
