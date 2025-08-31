type CardProps = {
    date: string;
    name: string;
    message: string;
    color: string;
}

export function Card({ date, name, message, color }: CardProps) {
    const nameStyle = {
        fontWeight: 'bold',
        fontSize: 16,
        color: color
    }
    return (
        <>
            <style>{`
                .card:hover {
                background-color: #ccc;
                cursor: pointer;
            `}</style>
            
            <div className="card" style={{border: '1px solid #ccc', borderRadius: "10px", padding: "5px"}}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: '4px', padding: "2px"}}>
                    {date}
                </div>

                <div style={{ display: 'flex'}}>
                    <div style={nameStyle}>{name}</div>
                    <div style={{ fontSize: 16, color: '#000' }}>: {message}</div>
                </div>
            </div>
        </>
    )
}