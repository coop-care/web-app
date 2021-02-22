import { plainToClass } from "class-transformer";
import { ObjectID } from "bson";
import { store } from "../store";
import { Client, ProblemRecord, Task } from "../models";
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
  return sampleData.map(() => new ObjectID());
}

export function importSamplesV1() {
  return Client.fromObject(sampleData) as Client[];
}

export function importSamplesV2() {
  // modify dates so sample data looks "fresh"
  const startDate = daysAgo(3 * 30 + 15);
  const sampleJSON = JSON.stringify(sampleData)
    .replace(/"2020-01/g, "\"" + startDate.toISOString().substr(0, 7));
  const clients: typeof sampleData = JSON.parse(sampleJSON);

  return clients.map(json => {
    // create client
    const originalClients = store.state.clients.slice();
    const createdAt = new Date(json.createdAt);
    const client = new Client();
    client._id = new ObjectID();
    client.createdAt = createdAt;
    Object.assign(client.contact, json.contact);
    store.commit.setClients(originalClients.concat(client));
    const params = { clientId: client._id.toHexString() };

    // create problem records
    json.problems.forEach((problem: any) => {
      const record = plainToClass(ProblemRecord, problem);
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
        now: createdAt,
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
    json.problems.forEach((problem: any) => {
      (problem._completedOccurrences || []).forEach((occurrence: any) => {
        const reminderId: string = occurrence[0] || "";
        const daysLater: number = occurrence[1] || 1;
        const reminder = client.findReminder(reminderId);
        if (reminder) {
          store.commit.toggleTaskCompletion({
            task: new Task(reminder, problem.id),
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
            userId: store.getters.userId
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