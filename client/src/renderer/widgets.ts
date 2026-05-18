import type { ComponentType } from 'react';
import type { FieldRendererProps } from './FieldRenderer';

type WidgetProps = FieldRendererProps;
const registry = new Map<string, ComponentType<WidgetProps>>();

export function registerWidget(name: string, Component: ComponentType<WidgetProps>): void {
  registry.set(name, Component);
}
export function getWidget(name?: string): ComponentType<WidgetProps> | null {
  return name ? registry.get(name) ?? null : null;
}
