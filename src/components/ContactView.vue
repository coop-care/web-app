<template>
  <div v-if="contact">
    <q-resize-observer @resize="onResize" />

    <div v-if="!isEditing || isDisabled" >
      <div class="row justify-end">
        <q-btn 
          v-if="!isDisabled"
          icon="edit"
          round
          outline
          color="primary"
          size="10.5px"
          @click="isEditing = true"
          :title="$t('editContact')"
          :class="['shadow-1', $q.screen.gt.xs ? '' : 'q-mr-sm']"
        />
      </div>

      <div :class="['text-h4 text-center', !contact.name ? 'text-italic text-weight-light text-grey-7' : '']">
        {{ contact.name || $t("withoutNames") }}
      </div>
      <div 
        v-if="contact.relationship && !noRelationship" 
        class="text-body1 text-grey-7 text-center"
      >
        {{ localizeLabel(contact.relationship) }}
      </div>
      <div 
        v-if="professionalSubtitle" 
        class="text-body1 text-grey-7 text-center"
      >
        {{ professionalSubtitle }}
      </div>

      <div class="row justify-center q-my-md non-selectable">
        <div 
          v-if="contact.phoneNumbers.length"
          class="q-mx-sm column items-center"
        >
          <q-btn
            icon="fas fa-phone"
            round
            unelevated
            color="primary"
            class="q-mb-xs"
            @click="call(contact.phoneNumbers[0])"
          />
          <div class="text-caption text-primary contact-button-label ellipsis">
            {{ localizeLabel(contact.phoneNumbers[0].label) }}
          </div>
        </div>
        <div 
          v-if="contact.emailAddresses.length"
          class="q-mx-sm column items-center"
        >
          <q-btn
            icon="fas fa-envelope"
            round
            unelevated
            color="primary"
            class="q-mb-xs"
            @click="email(contact.emailAddresses[0])"
          />
          <div class="text-caption text-primary contact-button-label ellipsis">
            {{ localizeLabel(contact.emailAddresses[0].label) }}
          </div>
        </div>
      </div>

      <q-list class="text-size-adjust-md q-mb-md">
        <no-data-item
          v-if="!contactDetails.length"
          :text-label="$t('noContactDetails')"
          button-classes="text-weight-regular"
          :hide-button="isDisabled"
          @click="isEditing = true"
        />
        <labeled-item
          v-for="(item, index) in contactDetails"
          :key="'contactItem' + index"
          :item="item"
          :compactLayout="compactLayout"
          class="text-primary"
        />
      </q-list>
    </div>

    <div v-else>
      <div class="q-mb-sm row justify-end">
        <q-btn 
          :label="$t('done')"
          rounded
          no-caps
          dense
          color="primary"
          @click="isEditing = false"
          class="q-px-sm"
        />
      </div>

      <div class="column text-size-adjust-md">
        <div class="mb-row-dense">
          <q-toggle 
            v-if="!noOrganization"
            :value="contact.isOrganization" 
            @input="saveContact({isOrganization: $event})"
            :label="$t('contactIsAnOrganization') + ':'"
            left-label
          />
          <reveal-button
            v-if="!noDegree && !contact.isOrganization"
            :label="$t('addAcademicTitleButton')"
            :reveal-immediately="contact.degree.length > 0"
            button-class="q-py-sm"
          >
            <q-input
              :value="contact.degree"
              @input="updateContact({degree: $event})"
              @change="save"
              :label="$t('degree')"
            />
          </reveal-button>
          <q-input
            v-if="!contact.isOrganization"
            :value="contact.firstName"
            @input="updateContact({firstName: $event})"
            @change="save"
            :label="$t('firstName')"
          />
          <q-input
            v-if="!contact.isOrganization"
            :value="contact.lastName"
            @input="updateContact({lastName: $event})"
            @change="save"
            :label="$t('lastName')"
          />
          <date-time-input
            v-if="!noBirthday && !contact.isOrganization"
            :value="contact.birthday"
            @input="saveContact({birthday: $event})"
            :label="$t('birthday') + ' (' + $t('dateFormatPlaceholder') + ')'"
            :format="$t('dateFormat')"
          />
          <selectable-input
            v-if="!noRelationship && !contact.isOrganization"
            :value="contact.relationship"
            :label="$t('relationshipToClient')"
            :options="$store.direct.getters.relationshipLabels.map(makeOption)"
            clearable
            @input="saveContact({relationship: $event})"
          />
          <selectable-input
            v-if="!noProfession && !contact.isOrganization"
            :value="contact.profession"
            :label="$t('profession')"
            :options="professionLabels"
            clearable
            @input="saveContact({profession: $event})"
          />
          <q-input
            v-if="!noOrganization"
            :value="contact.organization"
            @input="updateContact({organization: $event})"
            @change="save"
            :label="$t('organizationName')"
          />
          <selectable-input
            v-if="!noProfession && contact.isOrganization"
            :value="contact.profession"
            :label="$t('profession')"
            :options="professionLabels"
            clearable
            @input="saveContact({profession: $event})"
          />
        </div>

        <labeled-value-editor
          :items="contact.phoneNumbers"
          :labels="$store.direct.getters.phoneLabels.map(makeOption)"
          :add-button-label="$t('addPhoneNumber')"
          @add="addPhoneNumber"
          @remove="removePhoneNumber($event)"
          @input:label="saveObject($event.target, {label: $event.value})"
          class="mb-row-dense"
          v-slot="{ item }"
        >
          <q-input
            :value="item.value"
            @input="update(item, {value: $event})"
            @change="save"
            :placeholder="$t('phone')"
            dense
            type="phone"
          />
        </labeled-value-editor>
        <labeled-value-editor
          :items="contact.emailAddresses"
          :labels="$store.direct.getters.emailLabels.map(makeOption)"
          :add-button-label="$t('addEmailAddress')"
          @add="addEmailAddress"
          @remove="removeEmailAddress($event)"
          @input:label="saveObject($event.target, {label: $event.value})"
          class="mb-row-dense"
          v-slot="{ item }"
        >
          <q-input
            :value="item.value"
            @input="update(item, {value: $event})"
            @change="save"
            :placeholder="$t('email')"
            dense
            type="email"
          />
        </labeled-value-editor>
        <labeled-value-editor
          :items="contact.postalAddresses"
          :labels="$store.direct.getters.addressLabels.map(makeOption)"
          :add-button-label="$t('addPostalAddress')"
          @add="addPostalAddress"
          @remove="removePostalAddress($event)"
          @input:label="saveObject($event.target, {label: $event.value})"
          class="mb-row-dense"
          v-slot="{ item }"
        >
          <div class="column">
            <q-input
              :value="item.value.street1"
              @input="update(item.value, {street1: $event})"
              @change="save"
              :placeholder="$t('street')"
              dense
              autogrow
            />
            <div class="row">
              <q-input
                :value="item.value.postalCode"
                @input="update(item.value, {postalCode: $event})"
                @change="save"
                :placeholder="$t('postalCode')"
                dense
                class="col"
              />
              <q-input
                :value="item.value.city"
                @input="update(item.value, {city: $event})"
                @change="save"
                :placeholder="$t('city')"
                dense
                class="col"
              />
            </div>
            <q-input
              :value="item.value.country"
              @input="update(item.value, {country: $event})"
              @change="save"
              :placeholder="$t('country')"
              dense
            />
          </div>
        </labeled-value-editor>

        <q-input
          :value="contact.notes"
          @input="updateContact({notes: $event})"
          @change="save"
          autogrow
          :label="$t('contactNotes')"
          class="mb-row-dense"
        />

        <div 
          v-if="!noDelete"
          class="row justify-center q-mb-xl"
        >
          <q-btn
            :label="$t('deleteContact')"
            rounded
            outline
            no-caps
            color="negative"
            dense
            class="q-px-sm shadow-1 bg-white"
            @click="deleteContact"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<style lang="sass">
.contact-button-label
  text-align: center
  max-width: 8em
</style>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";
import RecordMixin from "../mixins/RecordMixin";
import { Contact, LabeledValue, PostalAddress, Client } from "../models";
import NoDataItem from "../components/NoDataItem.vue";
import LabeledItem, { LabeledItemType } from "../components/LabeledItem.vue";
import RevealButton from "../components/RevealButton.vue";
import SelectableInput from "../components/SelectableInput.vue";
import LabeledValueEditor from "../components/LabeledValueEditor.vue";
import DateTimeInput from "../components/DateTimeInput.vue";

@Component({
  components: {
    NoDataItem,
    LabeledItem,
    RevealButton,
    SelectableInput,
    LabeledValueEditor,
    DateTimeInput
  }
})
export default class ContactView extends RecordMixin {
  @Prop(Object) readonly contact!: Contact;
  @Prop(Boolean) readonly noDegree!: boolean;
  @Prop(Boolean) readonly noBirthday!: boolean; 
  @Prop(Boolean) readonly noProfession!: boolean;
  @Prop(Boolean) readonly noRelationship!: boolean;
  @Prop(Boolean) readonly noOrganization!: boolean;
  @Prop(Boolean) readonly noDelete!: boolean;

  isEditing = false;
  width = Infinity;

  @Watch("contact")
  onContactChanged() {
    if (this.$route.query.edit == "1" && !this.isDisabled) {
      void this.$router.replace({
        name: this.$route.name || undefined,
        params: this.$route.params
      });
      this.isEditing = true;
    } else {
      this.isEditing = false;
    }
  }

  get professionalSubtitle() {
    const texts: string[] = []

    if (!this.noProfession && this.contact.profession) {
      texts.push(this.localizeLabel(this.contact.profession));
    }
    if (!this.noOrganization && !this.contact.isOrganization && this.contact.organization) {
      texts.push(this.contact.organization);
    }

    return texts.join(", ");
  }
  get contactDetails() {
    const result: LabeledItemType[] = [];

    return result.concat(this.contact.phoneNumbers.map((item, index, list) => {
      return {
        label: this.localizeLabel(item.label),
        value: item.value,
        icon: "fas fa-phone",
        classes: this.contactGroupClassIfNeeded(index, list),
        action: () => this.call(item)
      }
    })).concat(this.contact.emailAddresses.map((item, index, list) => {
      return {
        label: this.localizeLabel(item.label),
        value: item.value,
        icon: "fas fa-envelope",
        classes: this.contactGroupClassIfNeeded(index, list),
        action: () => this.email(item)
      }
    })).concat(this.contact.postalAddresses.map((item, index, list) => {
      return {
        label: this.localizeLabel(item.label),
        value: this.localizeAddress(item.value),
        icon: "fas fa-map-marker",
        classes: this.contactGroupClassIfNeeded(index, list),
        action: () => this.showMap(item)
      }
    })).concat(this.contact.birthday ? [
      {
        label: this.$t("birthday") as string,
        value: this.$d(this.contact.birthday, "DateFull")
      }
    ] : []).concat(this.contact.notes ? [
      {
        label: this.$t("contactNotes") as string,
        value: this.contact.notes
      }
    ] : []);
  }
  get professionLabels() {
    return this.$store.direct.getters.professionLabels
      .map(this.makeOption)
      .sort(Client.sortByLabel)
  }
  get compactLayout() {
    return this.width <= 400
  }

  private onResize() {
    this.width = (this.$el as HTMLElement).offsetWidth;
  }

  call(phoneNumber: LabeledValue<string>) {
    location.href = "tel:" + phoneNumber.value;
  }
  email(email: LabeledValue<string>) {
    location.href = "mailto:" + email.value;
  }
  showMap(address: LabeledValue<PostalAddress>) {
    if (this.$q.platform.is.mac || this.$q.platform.is.ios) {
      location.href = "maps://?address=" + Contact.postalAddressAsSearchString(address.value);
    } else {
      location.href = "geo:0,0?q=" + Contact.postalAddressAsSearchString(address.value);
    }
  }

  addPhoneNumber() {
    const newValue = this.contact.makePhoneNumber();
    this.saveContact({phoneNumbers: this.contact.phoneNumbers.concat([newValue])});
  }
  removePhoneNumber(index: number) {
    this.saveContact({phoneNumbers: this.removeAtIndex(this.contact.phoneNumbers, index)});
  }
  addEmailAddress() {
    const newValue = this.contact.makeEmailAddress();
    this.saveContact({emailAddresses: this.contact.emailAddresses.concat([newValue])});
  }
  removeEmailAddress(index: number) {
    this.saveContact({emailAddresses: this.removeAtIndex(this.contact.emailAddresses, index)});
  }
  addPostalAddress() {
    const newValue = this.contact.makePostalAddress("");
    this.saveContact({postalAddresses: this.contact.postalAddresses.concat([newValue])});
  }
  removePostalAddress(index: number) {
    this.saveContact({postalAddresses: this.removeAtIndex(this.contact.postalAddresses, index)});
  }
  removeAtIndex<T>(array: T[], index: number) {
    const copy = array.slice();
    copy.splice(index, 1);
    return copy;
  }

  localizeLabel(label: string) {
    return Contact.predefinedLabels.includes(label) ? 
      this.$t(label) as string : 
      label;
  }
  localizeAddress(address: PostalAddress) {
    return (this.$t("postalAddressFormat", address) as string)
      .replace(/(\\n)+/g, "\n");
  }
  contactGroupClassIfNeeded(index: number, list: any[]) {
    return index == list.length - 1 ? "border-bottom-grey" : "";
  }
  makeOption(label: string) {
    return {
      label: this.localizeLabel(label),
      value: label
    }
  }

  updateContact(changes: Partial<Contact>) {
    this.update(this.contact, changes);
  }
  saveContact(changes: Partial<Contact>) {
    this.update(this.contact, changes);
    this.save();
  }
  saveObject<T>(target: T, changes: Partial<T>) {
    this.update(target, changes);
    this.save();
  }
  deleteContact() {
    this.$q.dialog({
      title: this.$t("confirmDeletionTitle") as string,
      message: this.$t("confirmContactDeletionMessage", {
        name: this.contact.name || this.$t("withoutNames")
      }) as string,
      persistent: true,
      ok: {
        label: this.$t("delete"),
        rounded: true,
        flat: true,
        noCaps: true,
        color: "negative"
      },
      cancel: {
        rounded: true,
        flat: true,
        noCaps: true
      }
    }).onOk(() => {
      this.$emit("delete", this.contact.id);
    });
  }
  save() {
    this.$emit("save");
  }

  mounted() {
    this.onContactChanged();
  }
}
</script>
