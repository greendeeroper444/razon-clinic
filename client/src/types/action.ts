import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface ActionButton {
    id?: string;
    label: string;
    icon?: IconDefinition;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
    type?: 'primary' | 'outline' | 'danger';
}
