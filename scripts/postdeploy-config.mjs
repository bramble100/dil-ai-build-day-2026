// scripts/postdeploy-config.mjs
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const PROFILE = process.env.AWS_PROFILE || "922860206839_AdministratorAccess";
const REGION = process.env.AWS_REGION || "eu-central-1";
const STACK_NAME = process.env.STACK_NAME || "QuizGeneratorApp"; // root stack name

function aws(args) {
	return execFileSync("aws", args, { encoding: "utf8" }).trim();
}

function getOutput(outputKey) {
	const v = aws([
		"cloudformation",
		"describe-stacks",
		"--stack-name",
		STACK_NAME,
		"--region",
		REGION,
		"--profile",
		PROFILE,
		"--query",
		`Stacks[0].Outputs[?OutputKey=='${outputKey}'].OutputValue`,
		"--output",
		"text",
	]);
	if (!v || v === "None") {
		throw new Error(
			`Missing stack output '${outputKey}' on stack '${STACK_NAME}'.`,
		);
	}
	return v;
}

const apiUrl = getOutput("ApiGatewayUrl");
const bucketName = getOutput("FrontendBucketName");

writeFileSync(
	"config.json",
	JSON.stringify({ apiBaseUrl: apiUrl }, null, 2) + "\n",
	"utf8",
);

aws([
	"s3",
	"cp",
	"config.json",
	`s3://${bucketName}/config.json`,
	"--region",
	REGION,
	"--profile",
	PROFILE,
	"--cache-control",
	"no-cache, no-store, must-revalidate",
]);

console.log(
	`Uploaded config.json to s3://${bucketName}/config.json (apiBaseUrl=${apiUrl})`,
);
