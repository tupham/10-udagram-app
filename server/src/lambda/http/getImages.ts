import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const imagesTable = process.env.IMAGES_TABLE;
//const imageIdIndex = process.env.IMAGE_ID_INDEX;
const groupsTable = process.env.GROUPS_TABLE;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  //const imageId = event.pathParameters.imageId
  console.log('event.pathParameters: ', event.pathParameters);
  var groupId = event.pathParameters.groupId;
  console.log('groupId: ', groupId);
  var validGroupId = await groupExists(groupId);
  if(!validGroupId){
    return {
      statusCode: 404,
      headers:{
        'Access-Control-Allow-Origin':'*'
      },
      body: JSON.stringify({error: 'Group does not exist'})
    };
  }
  const images = await getImagesPerGroup(groupId);
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({items:images})
  }
}

async function groupExists(groupId: string){
    const result = await docClient.get({
        TableName: groupsTable,
        Key: {
            id: groupId
        }
    }).promise();
    console.log('get groups: ', result);
    return !!result.Item;
}

async function getImagesPerGroup(groupId: string){
    console.log('getImagesPerGroup: ', groupId);
    const result = await docClient.query({
        TableName: imagesTable,
        KeyConditionExpression: 'groupId = :groupId',
        ExpressionAttributeValues:{':groupId': groupId},
        ScanIndexForward: false
    }).promise();
    return result.Items;
}