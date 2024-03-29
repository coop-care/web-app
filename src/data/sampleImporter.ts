import { plainToInstance } from "class-transformer";
import { ObjectId } from "bson";
import { store } from "../store";
import { Client, ClientAgreements, ClientHealthInformation, Contact, Intervention, ProblemRecord, Task } from "../models";
import sampleData from "../data/sample1.json";

export function addSamples() {
  if (!store.getters.userId) {
    return Promise.reject("no logged in user or missing userId");
  }

  // save all clients sequentially to prevent race condition errors
  return importSamplesV2()
    .reduce((result, client) => {
      return result.then(() => {
        return store.dispatch.addClient(client).then(() => undefined);
      })
    }, Promise.resolve())
    .catch(error => console.error("Failed to insert documents:", error));
}

export function sampleClientIds() {
  return sampleData.map(json => new ObjectId(json._id));
}

export function importSamplesV1() {
  return Client.fromObject(sampleData) as Client[];
}

export function importSamplesV2() {
  // modify dates so sample data looks "fresh"
  const sampleJSON = JSON.stringify(sampleData)
    .replace(/"2020-01/g, "\"" + daysAgo(3 * 30 + 15).toISOString().substring(0, 7))
    .replace(/"2020-02/g, "\"" + daysAgo(2 * 30 + 15).toISOString().substring(0, 7))
    .replace(/"2020-03/g, "\"" + daysAgo(1 * 30 + 15).toISOString().substring(0, 7))
    .replace(/"2020-04/g, "\"" + daysAgo(0 * 30 + 15).toISOString().substring(0, 7));
  const clients: typeof sampleData = JSON.parse(sampleJSON);

  return clients.map(json => {
    // create client
    const originalClients = store.state.clients.slice();
    const createdAt = new Date(json.createdAt);
    const client = new Client();
    client._id = new ObjectId();
    client.createdAt = createdAt;
    Object.assign(client.contact, plainToInstance(Contact, json.contact));
    Object.assign(client.healthInformation, plainToInstance(ClientHealthInformation, json.healthInformation));
    Object.assign(client.agreements, plainToInstance(ClientAgreements, json.agreements));
    Object.assign(client.informalContacts, json.informalContacts.map((item: any) => plainToInstance(Contact, item)));
    Object.assign(client.formalContacts, json.formalContacts.map((item: any) => plainToInstance(Contact, item)));
    Object.assign(client.unrelatedReminders, (json.unrelatedReminders as any[]).map(item => plainToInstance(Intervention, item)));
    store.commit.setClients(originalClients.concat(client));
    const params = { clientId: client._id.toHexString() };

    // create problem records
    json.problems.forEach((problem: any) => {
      const record = plainToInstance(ProblemRecord, problem);
      if (record.outcomes.length) {
        record.outcomes[0].user = store.getters.userId;
      }
      // @ts-ignore
      delete record._completedOccurrences;
      // @ts-ignore
      delete record._additionalRatingsKBS;
      store.commit.createProblemRecord({
        problemRecord: record,
        ...params
      });
      store.commit.saveNewProblemRecord({
        now: record.createdAt,
        problemId: record.id,
        ...params
      });
    });

    // calculate occurrences
    store.commit.calculateOccurrences(client);

    // complete all scheduled occurrences
    client.forAllReminders((reminder, problem) => {
      reminder.occurrences.forEach(occurrence => {
        store.commit.toggleTaskCompletion({
          task: new Task(reminder, problem?.id, occurrence),
          isCompleted: true,
          date: occurrence.due,
          client: client
        });
      });
    });

    // complete specific anytime occurrences
    (json.problems as { id?: string; _completedOccurrences: any[] }[])
      .concat([{ "_completedOccurrences": json._completedOccurrences }])
      .forEach((item: any) => {
        (item._completedOccurrences || []).forEach((occurrence: any) => {
          const reminderId: string = occurrence[0] || "";
          const daysLater: number = occurrence[1] || 1;
          const reminder = client.findReminder(reminderId);
          if (reminder) {
            store.commit.toggleTaskCompletion({
              task: new Task(reminder, item.id),
              isCompleted: true,
              date: new Date(createdAt.getTime() + daysLater * 86400000),
              client: client
            });
          }
        });
      });

    // add additional ratings
    const kbs = ["knowledge", "behaviour", "status"];
    client.problems.forEach((problem, problemIndex) => {
      problem.ratingReminder.occurrences.forEach((occurence, outcomeIndex) => {
        const problem = json.problems[problemIndex];
        // @ts-ignore
        const kbsRating: Array<number | string> = problem._additionalRatingsKBS?.[outcomeIndex] || [];
        kbsRating.forEach((value, index) => {
          const changes = !isNaN(value as number) ?
            { observation: value } :
            { comment: value };
          store.commit.updateNewOutcome({
            changes: changes,
            ratingType: kbs[index % 3],
            problemId: problem.id,
            ...params
          });
        });
        store.commit.updateNewOutcome({
          changes: {
            createdAt: occurence.due,
            user: store.getters.userId
          },
          problemId: problem.id,
          ...params
        });
      });
    });

    // sort change history chronologically
    store.commit.updateObject({
      target: client,
      changes: {
        changeHistory: client.changeHistory.slice().sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime();
        })
      }
    });

    // reset store state
    store.commit.setClients(originalClients);
    client._id = undefined;

    return client;
  });
}

function daysAgo(days: number, hours = 0) {
  return new Date(Date.now() - days * 86400000 + hours * 3600000);
}