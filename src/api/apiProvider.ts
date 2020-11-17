import Vue from "vue";
import CoopCareApiInterface from "./coopCareApiInterface";
import DemoApi from "./demo";
import StitchApi from "./stitch";
import store from "../store";
import { User, TeamMember, Team, Client } from "../models";

declare module "vue/types/vue" {
    interface Vue {
        $ccApi: CoopCareApiInterface;
    }
}

let ccApi: CoopCareApiInterface;

if (process.env.BACKEND == "demo") {
    ccApi = new DemoApi();
} else {
    ccApi = new StitchApi("openomaha-elgvq", "openomaha");

    ccApi.authListener = (changeType) => {
        if (changeType == "sessionEnded") {
            store.direct.dispatch.logout()
                .then(() => location.reload())
                .catch(error => console.error("error during logout", error));
        }
    };

    ccApi.userListener = (changeType, data) => {
        const isCurrentUser = data && store.state.currentUser?.equals(data)

        if (data && (changeType == "replace" || changeType == "update")) {
            let user = TeamMember.fromObject(data) as TeamMember
            if (isCurrentUser) {
                user = User.fromObject(data) as User;
                store.direct.commit.setCurrentUser(user as User);
            }
            store.direct.commit.updateTeamMember(user);
        } else {
            if (isCurrentUser) {
                void store.direct.dispatch.fetchUserFromDB({ locale: (data as User).locale });
            }
            void store.direct.dispatch.fetchTeamMembersFromDB();
        }
    };

    ccApi.teamListener = (changeType, data) => {
        if (data && (changeType == "replace" || changeType == "update")) {
            store.direct.commit.setTeam(Team.fromObject(data) as Team);
        } else {
            void store.direct.dispatch.fetchTeamsFromDB();
        }
    };

    ccApi.clientListener = (changeType, data) => {
        if (data && (changeType == "replace" || changeType == "update")) {
            store.direct.commit.updateClient(Client.fromObject(data) as Client);
        } else {
            void store.direct.dispatch.fetchClientsFromDB();
        }
    };
}

export { ccApi };
Vue.prototype.$ccApi = ccApi;
