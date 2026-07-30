/**
 * xAPI (Experience API) learning-analytics reporting.
 *
 * Builds and POSTs xAPI statements to the configured LRS. Kept free of any
 * widget/DOM state so it can be unit-tested and reused; the host passes in the
 * small amount of session config it needs.
 */

/** Session configuration needed to emit a statement. */
export interface XApiConfig {
	/** Whether statements should actually be sent. */
	enabled: boolean;
	/** Pseudonymous per-session name used to derive the actor. */
	rndName: string;
	/** LRS authorization key. */
	apiKey: string;
}

/** Endpoint of the RWTH Aachen learning record store. */
const LRS_ENDPOINT = "https://lrs.elearn.rwth-aachen.de/data/xAPI/statements";

/** Maps an internal action verb to its xAPI id and bilingual display. */
interface VerbEntry {
	id: string;
	de: string;
	en: string;
}

/** Lookup table of supported action verbs. Unknown actions emit an empty verb. */
const VERBS: Record<string, VerbEntry> = {
	pressed: {
		id: "http://future-learning.info/xAPI/verb/pressed",
		de: "drückte",
		en: "pressed",
	},
	completed: {
		id: "http://activitystrea.ms/schema/1.0/complete",
		de: "beendete",
		en: "completed",
	},
	selected: {
		id: "https://brindlewaye.com/xAPITerms/verbs/selected",
		de: "wählte",
		en: "selected",
	},
	closed: {
		id: "http://activitystrea.ms/schema/1.0/close",
		de: "schloss",
		en: "closed",
	},
	focused: {
		id: "http://id.tincanapi.com/verb/focused",
		de: "wählte",
		en: "focused",
	},
	submitted: {
		id: "https://w3id.org/xapi/dod-isd/verbs/submitted",
		de: "reichte ein",
		en: "submitted",
	},
	opened: {
		id: "http://activitystrea.ms/schema/1.0/open",
		de: "oeffnete",
		en: "opened",
	},
	created: {
		id: "http://activitystrea.ms/schema/1.0/create",
		de: "erstellte",
		en: "created",
	},
	registered: {
		id: "http://adlnet.gov/expapi/verbs/registered",
		de: "registrierte",
		en: "registered",
	},
	started: {
		id: "http://activitystrea.ms/schema/1.0/start",
		de: "startete",
		en: "started",
	},
	inserted: {
		id: "http://activitystrea.ms/schema/1.0/insert",
		de: "fügte ein",
		en: "inserted",
	},
	removed: {
		id: "http://activitystrea.ms/schema/1.0/remove",
		de: "entfernte",
		en: "removed",
	},
	added: {
		id: "http://activitystrea.ms/schema/1.0/add",
		de: "fügte hinzu",
		en: "added",
	},
	appended: {
		id: "http://activitystrea.ms/schema/1.0/append",
		de: "erweiterte",
		en: "appended",
	},
	joined: {
		id: "http://activitystrea.ms/schema/1.0/join",
		de: "verband",
		en: "joined",
	},
};

/**
 * Sends a single xAPI statement describing a learner interaction.
 *
 * @param config - session configuration (enabled flag, session name, LRS key)
 * @param action - the internal verb of the statement (see {@link VERBS})
 * @param context - the name of the object being interacted with
 * @param extra - optional result payload of the interaction
 */
export async function sendXApiStatement(
	config: XApiConfig,
	action: string,
	context: string,
	extra?: object
): Promise<void> {
	if (!config.enabled) {
		return;
	}

	const date: Date = new Date();
	const session: string =
		date.getDay().toString() +
		date.getMonth().toString() +
		date.getFullYear().toString() +
		config.rndName;

	const entry = VERBS[action];
	const verb = {
		id: entry ? entry.id : "",
		display: {
			de: entry ? entry.de : "",
			"en-US": entry ? entry.en : "",
		},
	};

	const statement = {
		actor: {
			mbox: "mailto:dummy@webwriterchemlabdummymail.de",
			name: session,
		},
		verb: verb,
		object: {
			objectType: "Agent",
			name: context,
			mbox:
				"mailto:dummy" +
				context.replace(":", "") +
				"@webwriterchemlabdummymail.de",
		},
		result: extra,
	};

	await fetch(LRS_ENDPOINT, {
		mode: "cors",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Experience-API-Version": "1.0.3",
			Authorization: config.apiKey,
		},
		body: JSON.stringify(statement),
	})
		.then((response) => {
			/*console.log(response)*/
		})
		.catch((error) => console.error(error.message));
}
