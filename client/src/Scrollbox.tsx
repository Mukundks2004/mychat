import React, { useEffect, useRef } from "react";

type ScrollBoxProps = {
    children: React.ReactNode;
    height: string;
    width: string;
    scrollDirection: 'vertical';
    childBorder: string;
}

export function ScrollBox({
    children,
    height = '300px',
    width = '100%',
    scrollDirection = 'vertical',
}: ScrollBoxProps) {

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [children]);

    const getOverflowStyle = (): React.CSSProperties => {
        switch (scrollDirection) {
            case 'vertical':
            default:
                return { overflowY: 'auto' as "auto", overflowX: 'hidden' as "hidden" };
        }
    };

    const containerStyle: React.CSSProperties = {
        width,
        height,
        border: '1px solid #000',
        borderRadius: "10px",
        ...getOverflowStyle(),
    }

    const wrappedChildren = React.Children.map(children, (child, index) => (
        <div
            key={index}
            style={{
                margin: '10px',                
            }}
        >
            {child}
        </div>
    ));

    return (
        <>
            <div style={containerStyle} ref={containerRef}>
                {wrappedChildren}
            </div>
        </>
    )
} 