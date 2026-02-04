import { composeRefs } from '@radix-ui/react-compose-refs';
import * as React from 'react';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

function createSlot(ownerName: string) {
  const SlotClone = createSlotClone(ownerName);
  const Slot = React.forwardRef<HTMLElement, SlotProps>(
    (props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const childrenArray = React.Children.toArray(children);
      const slottable = childrenArray.find(isSlottable);
      if (slottable) {
        const newElement = slottable.props.children;
        const newElementElement = React.isValidElement(newElement)
          ? (newElement as React.ReactElement<{ children?: React.ReactNode }>)
          : null;
        const newChildren = childrenArray.map((child) => {
          if (child === slottable) {
            if (React.Children.count(newElement) > 1)
              return React.Children.only(null);
            return newElementElement ? newElementElement.props.children : null;
          }
          return child;
        });
        return (
          <SlotClone ref={forwardedRef} {...slotProps}>
            {newElementElement
              ? React.cloneElement(newElementElement, undefined, newChildren)
              : null}
          </SlotClone>
        );
      }
      return (
        <SlotClone ref={forwardedRef} {...slotProps}>
          {children}
        </SlotClone>
      );
    },
  );
  Slot.displayName = `${ownerName}.Slot`;
  return Slot;
}

const Slot = createSlot('Slot');
const Root = Slot;

function createSlotClone(ownerName: string) {
  const SlotClone = React.forwardRef<HTMLElement, SlotProps>(
    (props, forwardedRef) => {
      const { children, ...slotProps } = props;
      if (React.isValidElement(children)) {
        const childrenRef = getElementRef(children);
        const mergedProps = mergeProps(
          slotProps,
          children.props as Record<string, unknown>,
        );
        if (children.type !== React.Fragment) {
          mergedProps.ref = forwardedRef
            ? composeRefs(forwardedRef, childrenRef)
            : childrenRef;
        }
        return React.cloneElement(children, mergedProps);
      }
      return React.Children.count(children) > 1
        ? React.Children.only(null)
        : null;
    },
  );
  SlotClone.displayName = `${ownerName}.SlotClone`;
  return SlotClone;
}

const SLOTTABLE_IDENTIFIER = Symbol('radix.slottable');

function createSlottable(ownerName: string) {
  const Slottable = ({ children }: { children: React.ReactNode }) => {
    return <React.Fragment>{children}</React.Fragment>;
  };
  Slottable.displayName = `${ownerName}.Slottable`;
  (Slottable as SlottableComponent).__radixId = SLOTTABLE_IDENTIFIER;
  return Slottable as SlottableComponent;
}

const Slottable = createSlottable('Slottable');

function isSlottable(
  child: React.ReactNode,
): child is React.ReactElement<{ children?: React.ReactNode }> {
  return (
    React.isValidElement(child) &&
    typeof child.type === 'function' &&
    '__radixId' in child.type &&
    (child.type as SlottableComponent).__radixId === SLOTTABLE_IDENTIFIER
  );
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          (childPropValue as (...args: unknown[]) => unknown)(...args);
          return (slotPropValue as (...args: unknown[]) => unknown)(...args);
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === 'style') {
      overrideProps[propName] = {
        ...(slotPropValue as React.CSSProperties | undefined),
        ...(childPropValue as React.CSSProperties | undefined),
      };
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue]
        .filter(Boolean)
        .join(' ');
    }
  }
  return { ...slotProps, ...overrideProps };
}

function getElementRef(element: React.ReactElement) {
  return (element.props as { ref?: React.Ref<HTMLElement> }).ref;
}

interface SlottableComponent extends React.FC<{ children: React.ReactNode }> {
  __radixId: symbol;
}

export { Root, Slot, Slottable, createSlot, createSlottable };
export type { SlotProps };
