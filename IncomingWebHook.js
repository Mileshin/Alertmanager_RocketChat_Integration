class Script {
    process_incoming_request({
        request
    }) {
        console.log(request.content);
        const resolved_emoji = " :white_check_mark: :white_check_mark: :white_check_mark: "
        const firing_emoji = " :fire: :fire: :fire: "
        const resolved_mesage = "**Problem was solved:**"
        const firing_mesage = "**There was a problem:**"

        var main_title = "Error: Status not found"
        if (request.content.status == "resolved") {
            main_title = resolved_emoji + resolved_mesage + resolved_emoji
        } else if (request.content.status == "firing") {
            main_title = firing_emoji + firing_mesage + firing_emoji
        }

        let fields = [];
        for (i = 0; i < request.content.alerts.length; i++) {
            var alert = request.content.alerts[i];

            if (!!alert.annotations.summary) {
                fields.push({
                    title: "summary",
                    value: alert.annotations.summary
                });
            }

            if (!!alert.annotations.description) {
                fields.push({
                    title: "description",
                    value: alert.annotations.description
                });
            }

            if (!!alert.annotations.url) {
                fields.push({
                    title: "url",
                    value: alert.annotations.url
                });

            }

            // Generate silence url
            if (request.content.status == "firing") {
                var uri_component = "{"
                for (const [key, value] of Object.entries(alert.labels)) {
                    uri_component = uri_component + key + "=\"" + value + "\", ";
                }
                fields.push({
                    title: "Silence URL",
                    value: request.content.externalURL + "/#/silences/new?filter=" + encodeURIComponent(uri_component.slice(0, -2) + "}")
                });
            }
        }

        return {
            content: {
                "username": "Alert bot",
                "text": main_title + "\n**" + alert.labels.alertname + "**\n" +
                    "**instance: **" + alert.labels.instance,
                "attachments": [{
                    "title_link": request.content.externalURL,
                    "collapsed": true,
                    "title": "Detail",
                    "fields": fields,
                    "image_url": alert.annotations.imageurl,
                }]
            }
        };

        return {
            error: {
                success: false
            }
        };
    }
}
