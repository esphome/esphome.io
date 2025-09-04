#! /bin/sh
jq '{
  automations: {
    actions: (
      (
        .automations.actions
        | map(
            if test("\\.") then
              capture("(?<domain>[^.]+)\\.(?<action>.+)")
            else
              { domain: "Core", action: . }
            end
          )
        | group_by(.domain)
        | map({
            (.[0].domain): map(.action)
          })
        | add
      )
    ),
    conditions: (
      (
        .automations.conditions
        | map(
            if test("\\.") then
              capture("(?<domain>[^.]+)\\.(?<action>.+)")
            else
              { domain: "Core", action: . }
            end
          )
        | group_by(.domain)
        | map({
            (.[0].domain): map(.action)
          })
        | add
      )
    )
  }
}'


